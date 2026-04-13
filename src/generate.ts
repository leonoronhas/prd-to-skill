import { detectTruncation, extractText } from "./extract.js";
import { buildMessages } from "./prompt.js";
import { detectProvider, getApiKey } from "./providers/detect.js";
import { deriveOutputPath, deriveSkillName, writeSkillFile } from "./output.js";
import { createSpinner } from "./spinner.js";
import { getTarget } from "./targets.js";
import type { Target } from "./targets.js";

export interface GenerateOptions {
  filePath: string;
  provider?: string;
  model?: string;
  name?: string;
  description?: string;
  output?: string;
  target: string;
  maxTokens: number;
  verbose: boolean;
}

export const generate = async (options: GenerateOptions): Promise<void> => {
  const provider = detectProvider(options.provider);
  const apiKey = getApiKey(provider);
  const model = options.model ?? provider.defaultModel;
  const name = options.name ?? deriveSkillName(options.filePath);
  const target: Target = getTarget(options.target);
  const outputPath = deriveOutputPath(name, target, options.output);

  if (options.verbose) {
    console.error(`Provider: ${provider.name}`);
    console.error(`Model: ${model}`);
    console.error(`Target: ${target.name} (${target.description})`);
  }

  // Step 1: Extract text
  const spinner = createSpinner("Extracting text from document...");

  const prdText = await extractText(options.filePath);

  const isTruncated = detectTruncation(prdText);

  if (isTruncated) {
    spinner.stop(
      `⚠ Extracted ${prdText.length.toLocaleString()} characters — document appears to be incomplete or cut off`,
    );
    console.error(
      "  The document ends abruptly. The generated output will cover only what was provided.",
    );
  } else {
    spinner.stop(`✓ Extracted ${prdText.length.toLocaleString()} characters`);
  }

  if (options.verbose) {
    console.error(`  Source: ${options.filePath}`);
  }

  // Step 2: Build prompt
  const messages = buildMessages(prdText, name, target, options.description, isTruncated);

  // Step 3: Send to LLM
  const llmSpinner = createSpinner(
    `Generating ${target.name} file via ${provider.name} (${model})...`,
  );

  const startTime = Date.now();

  // Pulse elapsed time while waiting
  const elapsed = setInterval(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    llmSpinner.update(
      `Generating ${target.name} file via ${provider.name} (${model})... ${secs}s`,
    );
  }, 1000);

  const result = await provider.complete(
    { apiKey, model, maxTokens: options.maxTokens },
    messages,
  );

  clearInterval(elapsed);
  const totalSecs = ((Date.now() - startTime) / 1000).toFixed(1);

  const outputTruncated = detectTruncation(result);

  if (outputTruncated) {
    llmSpinner.stop(`⚠ Generated in ${totalSecs}s — output appears cut off`);
  } else {
    llmSpinner.stop(`✓ Generated in ${totalSecs}s`);
  }

  // Step 4: Write file
  const writeSpinner = createSpinner("Writing file...");
  await writeSkillFile(result, outputPath);
  writeSpinner.stop(`✓ Saved to ${outputPath}`);

  // Step 5: Warn about truncated output with actionable suggestions
  if (outputTruncated) {
    const nextMaxTokens = options.maxTokens * 2;
    console.error("");
    console.error(
      "⚠ The generated output appears incomplete — the LLM likely hit the token limit.",
    );
    console.error("");
    console.error("  To fix this, try one of the following:");
    console.error("");
    console.error(
      `  1. Increase max tokens:    prd-to-skill ${options.filePath} --max-tokens ${nextMaxTokens}`,
    );
    console.error(`  2. Use a higher-capacity model with a larger output window`);
    console.error(
      `  3. Split your PRD into smaller focused documents and generate a skill for each`,
    );
    console.error("");
    console.error(`  Current --max-tokens: ${options.maxTokens}`);
  }
};
