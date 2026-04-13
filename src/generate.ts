import { extractText } from "./extract.js";
import { buildMessages } from "./prompt.js";
import { detectProvider, getApiKey } from "./providers/detect.js";
import { deriveOutputPath, deriveSkillName, writeSkillFile } from "./output.js";
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
    console.error(`Extracting text from: ${options.filePath}`);
  }

  const prdText = await extractText(options.filePath);

  if (options.verbose) {
    console.error(`Extracted ${prdText.length} characters`);
  }

  const messages = buildMessages(prdText, name, target, options.description);

  if (options.verbose) {
    console.error("Sending to LLM...");
  }

  const result = await provider.complete(
    { apiKey, model, maxTokens: options.maxTokens },
    messages,
  );

  await writeSkillFile(result, outputPath);
  console.log(`${target.name} file written to: ${outputPath}`);
};
