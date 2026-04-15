import { join } from "node:path";
import { detectTruncation, extractText } from "./extract.js";
import { deriveSkillName, writeSkillFile } from "./output.js";
import { detectProvider, getApiKey } from "./providers/detect.js";
import { createSpinner } from "./spinner.js";
import { getTarget } from "./targets.js";
import type { Target } from "./targets.js";
import { buildPlanMessages, buildSkillMessages } from "./splitPrompt.js";
import type { SkillPlan } from "./splitPrompt.js";

export const SPLIT_UNSUPPORTED_TARGETS = ["codex", "aider"];

export interface SplitOptions {
  filePath: string;
  provider?: string;
  model?: string;
  name?: string;
  target: string;
  maxTokens: number;
  verbose: boolean;
}

const parseSkillPlan = (raw: string): SkillPlan[] => {
  const cleaned = raw
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();
  const parsed = JSON.parse(cleaned) as unknown;
  if (!Array.isArray(parsed)) throw new Error("LLM returned non-array for skill plan");
  return parsed.map((item: unknown) => {
    if (typeof item !== "object" || item === null)
      throw new Error("Invalid skill plan item");
    const { name, description } = item as Record<string, unknown>;
    if (typeof name !== "string" || typeof description !== "string") {
      throw new Error(
        "Each skill plan item must have string name and description fields",
      );
    }
    return { name, description };
  });
};

const buildIndexContent = (
  prdName: string,
  skills: SkillPlan[],
  target: Target,
  filenames: string[],
): string => {
  const lines: string[] = [];

  if (target.name === "claude") {
    lines.push("---");
    lines.push(`name: ${prdName}-index`);
    lines.push(
      `description: Use when you need an overview of all ${prdName} skills and want to know which one to load for your current task.`,
    );
    lines.push("---");
    lines.push("");
  } else if (target.name === "cursor") {
    lines.push("---");
    lines.push(
      `description: Index of all ${prdName} skill files generated from the PRD.`,
    );
    lines.push("globs:");
    lines.push("alwaysApply: false");
    lines.push("---");
    lines.push("");
  } else if (target.name === "copilot") {
    lines.push("---");
    lines.push(
      `description: Index of all ${prdName} skill files generated from the PRD.`,
    );
    lines.push('applyTo: "**"');
    lines.push("---");
    lines.push("");
  }

  lines.push(`# ${prdName} — Skills Index`);
  lines.push("");
  lines.push(
    `Generated ${skills.length} focused skill files from the PRD. Load only the skills relevant to your current task:`,
  );
  lines.push("");

  skills.forEach((skill, i) => {
    lines.push(`- **[${skill.name}](./${filenames[i]})** — ${skill.description}`);
  });

  return lines.join("\n");
};

export const split = async (options: SplitOptions): Promise<void> => {
  if (SPLIT_UNSUPPORTED_TARGETS.includes(options.target)) {
    throw new Error(
      `The "split" command does not support the "${options.target}" target because it uses a fixed output filename. Supported targets: claude, cursor, copilot, windsurf.`,
    );
  }

  const provider = detectProvider(options.provider);
  const apiKey = getApiKey(provider);
  const model = options.model ?? provider.defaultModel;
  const name = options.name ?? deriveSkillName(options.filePath);
  const target: Target = getTarget(options.target);
  const outputDir = target.outputDir(process.cwd());

  if (options.verbose) {
    console.error(`Provider: ${provider.name}`);
    console.error(`Model: ${model}`);
    console.error(`Target: ${target.name} (${target.description})`);
  }

  // Step 1: Extract text
  const extractSpinner = createSpinner("Extracting text from document...");
  const prdText = await extractText(options.filePath);
  const isTruncated = detectTruncation(prdText);

  if (isTruncated) {
    extractSpinner.stop(
      `⚠ Extracted ${prdText.length.toLocaleString()} characters — document appears incomplete`,
    );
    console.error(
      "  The document ends abruptly. Skills will be generated from only the available content.",
    );
  } else {
    extractSpinner.stop(`✓ Extracted ${prdText.length.toLocaleString()} characters`);
  }

  if (options.verbose) {
    console.error(`  Source: ${options.filePath}`);
  }

  // Step 2: Plan — ask LLM to identify skill categories
  const planSpinner = createSpinner("Analyzing PRD to identify skill categories...");
  const planMessages = buildPlanMessages(prdText);
  const planRaw = await provider.complete(
    { apiKey, model, maxTokens: 1024 },
    planMessages,
  );

  let skills: SkillPlan[];
  try {
    skills = parseSkillPlan(planRaw);
  } catch (err) {
    planSpinner.stop("✗ Failed to parse skill categories from LLM response");

    throw new Error(
      `Could not parse skill plan: ${(err as Error).message}\n\nRaw LLM response:\n${planRaw}`,
      { cause: err },
    );
  }

  planSpinner.stop(
    `✓ Identified ${skills.length} skill categories: ${skills.map((s) => s.name).join(", ")}`,
  );

  // Step 3: Generate each skill in parallel
  const genSpinner = createSpinner(`Generating ${skills.length} skill files...`);
  const startTime = Date.now();

  const elapsed = setInterval(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    genSpinner.update(`Generating ${skills.length} skill files... ${secs}s`);
  }, 1000);

  const results = await Promise.all(
    skills.map(async (skill) => {
      const messages = buildSkillMessages(
        prdText,
        skill.name,
        skill.description,
        name,
        target,
      );
      const content = await provider.complete(
        { apiKey, model, maxTokens: options.maxTokens },
        messages,
      );
      return { skill, content };
    }),
  );

  clearInterval(elapsed);
  const totalSecs = ((Date.now() - startTime) / 1000).toFixed(1);
  genSpinner.stop(`✓ Generated ${skills.length} skill files in ${totalSecs}s`);

  // Step 4: Write skill files + index
  const writeSpinner = createSpinner("Writing files...");

  const filenames: string[] = [];
  for (const { skill, content } of results) {
    const filename = `${name}-${skill.name}${target.extension}`;
    filenames.push(filename);
    await writeSkillFile(content, join(outputDir, filename));
  }

  const indexFilename = `${name}-index${target.extension}`;
  const indexContent = buildIndexContent(name, skills, target, filenames);
  await writeSkillFile(indexContent, join(outputDir, indexFilename));

  writeSpinner.stop(`✓ Saved ${skills.length + 1} files to ${outputDir}/`);

  // Step 5: List generated files
  console.error("");
  console.error("  Generated files:");
  for (let i = 0; i < skills.length; i++) {
    console.error(`    ${filenames[i]}  —  ${skills[i].description}`);
  }
  console.error(`    ${indexFilename}  —  Index of all skills`);
  console.error("");
};
