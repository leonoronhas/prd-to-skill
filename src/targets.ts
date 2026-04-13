import { join } from "node:path";

export interface Target {
  name: string;
  description: string;
  extension: string;
  outputDir: (cwd: string) => string;
  formatInstructions: string;
}

const targets: Record<string, Target> = {
  claude: {
    name: "claude",
    description: "Claude Code skill (.md with YAML frontmatter)",
    extension: ".md",
    outputDir: (cwd) => join(cwd, ".claude", "commands"),
    formatInstructions: `The file MUST begin with YAML frontmatter:

---
name: <kebab-case-name>
description: <1-2 sentence description of when to use this skill. Start with "Use when..." This description is used for automatic skill matching.>
---

Then the markdown body with ## sections.`,
  },

  cursor: {
    name: "cursor",
    description: "Cursor rule (.mdc with YAML frontmatter)",
    extension: ".mdc",
    outputDir: (cwd) => join(cwd, ".cursor", "rules"),
    formatInstructions: `The file MUST begin with YAML frontmatter:

---
description: <1-2 sentence description of when this rule applies>
globs:
alwaysApply: true
---

Then the markdown body with ## sections. Do NOT include a "name" field in frontmatter — Cursor uses the filename as the name.`,
  },

  codex: {
    name: "codex",
    description: "OpenAI Codex CLI (AGENTS.md, plain markdown)",
    extension: ".md",
    outputDir: (cwd) => cwd,
    formatInstructions: `The file is plain markdown with NO YAML frontmatter. Start directly with a heading:

# <Title>

Use standard markdown with ## sections. This file will be read as AGENTS.md by the Codex CLI. Keep it under 32 KiB.`,
  },

  copilot: {
    name: "copilot",
    description: "GitHub Copilot instructions (.md in .github/)",
    extension: ".instructions.md",
    outputDir: (cwd) => join(cwd, ".github", "instructions"),
    formatInstructions: `The file MUST begin with YAML frontmatter:

---
description: <1-2 sentence description of what this instruction covers>
applyTo: "**"
---

Then the markdown body with ## sections. Write instructions as guidance for a coding assistant.`,
  },

  windsurf: {
    name: "windsurf",
    description: "Windsurf rule (.md in .windsurf/rules/)",
    extension: ".md",
    outputDir: (cwd) => join(cwd, ".windsurf", "rules"),
    formatInstructions: `The file is plain markdown with NO YAML frontmatter. Start directly with a heading:

# <Title>

Use structured markdown with ## sections, bullet points, and numbered lists for clear rules.`,
  },

  aider: {
    name: "aider",
    description: "Aider conventions (CONVENTIONS.md, plain markdown)",
    extension: ".md",
    outputDir: (cwd) => cwd,
    formatInstructions: `The file is plain markdown with NO YAML frontmatter. Start directly with a heading:

# <Title>

Use structured markdown with ## sections. Focus on coding guidelines, style preferences, patterns, and conventions that an AI coding assistant should follow.`,
  },
};

export const TARGET_NAMES = Object.keys(targets);

export const getTarget = (name: string): Target => {
  const target = targets[name];
  if (!target) {
    throw new Error(`Unknown target "${name}". Supported: ${TARGET_NAMES.join(", ")}`);
  }
  return target;
};

export const getDefaultFilename = (target: Target, name: string): string => {
  if (target.name === "codex") return "AGENTS.md";
  if (target.name === "aider") return "CONVENTIONS.md";
  return `${name}${target.extension}`;
};
