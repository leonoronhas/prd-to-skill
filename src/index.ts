#!/usr/bin/env node

import { Command } from "commander";
import { generate } from "./generate.js";
import { printHelp } from "./help.js";
import { TARGET_NAMES } from "./targets.js";

const program = new Command();

program
  .name("prd-to-skill")
  .description(
    "Convert PRD documents (PDF/DOCX) into AI coding assistant instruction files",
  )
  .version("0.1.0");

program
  .command("help [provider]")
  .aliases(["h"])
  .description("Show detailed help, or setup guide for a specific provider")
  .action((provider?: string) => {
    printHelp(provider);
  });

program
  .argument("<file>", "Path to PRD file (.pdf or .docx)")
  .option("-p, --provider <name>", "LLM provider: openai | anthropic | google | mistral")
  .option("-m, --model <model>", "Model name (e.g. gpt-4o, claude-sonnet-4-20250514)")
  .option("-o, --output <path>", "Output file path (overrides default)")
  .option("-n, --name <name>", "Skill/rule name (default: derived from filename)")
  .option("-d, --description <text>", "Description for frontmatter")
  .option(`-t, --target <target>`, `Target tool: ${TARGET_NAMES.join(", ")}`, "claude")
  .option("--max-tokens <number>", "Max output tokens", "4096")
  .option("-v, --verbose", "Show extraction and API details")
  .action(async (file: string, opts) => {
    try {
      await generate({
        filePath: file,
        provider: opts.provider,
        model: opts.model,
        name: opts.name,
        description: opts.description,
        output: opts.output,
        target: opts.target,
        maxTokens: parseInt(opts.maxTokens, 10),
        verbose: opts.verbose ?? false,
      });
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
