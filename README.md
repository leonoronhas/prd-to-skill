# prd-to-skill

**Turn any PRD into an AI coding assistant instruction file — in one command.**

[![npm version](https://img.shields.io/npm/v/prd-to-skill)](https://www.npmjs.com/package/prd-to-skill)
[![license](https://img.shields.io/npm/l/prd-to-skill)](https://github.com/leonoronhas/prd-to-skill/blob/main/LICENSE)

`prd-to-skill` converts Product Requirements Documents (PDF and Word) into ready-to-use instruction files for **Claude Code**, **Cursor**, **OpenAI Codex CLI**, **GitHub Copilot**, **Windsurf**, and **Aider**. One command, correct format, right directory — no manual copy-paste.

It uses AI to intelligently extract only the implementation-relevant parts of your PRD (requirements, architecture, business rules, acceptance criteria) and discards project management noise (timelines, stakeholders, budgets). The output is a structured, actionable instruction file that your AI coding tool can use immediately.

Need granular control? The `split` command breaks one PRD into multiple focused skill files — one per topic — so you can load only the skills relevant to your current task.

## Why prd-to-skill?

- **Save hours of manual work** — stop copy-pasting PRD sections into markdown files by hand
- **Works with every major AI coding tool** — one CLI covers Claude Code skills, Cursor rules, Codex AGENTS.md, Copilot instructions, Windsurf rules, and Aider conventions
- **AI-powered extraction** — doesn't just dump raw text; intelligently transforms requirements into actionable instructions with code examples, decision criteria, and verification checklists
- **Split into focused skills** — generate multiple targeted skill files from one PRD (tech stack, business rules, architecture, etc.) and load only what's relevant
- **Bring your own LLM** — works with OpenAI, Anthropic, Google Gemini, and Mistral with zero SDK dependencies
- **Smart edge case handling** — detects truncated documents and incomplete LLM output, warns you, and suggests fixes
- **Zero config** — just set an API key and run `npx prd-to-skill ./prd.pdf`

## Quick Start

```bash
# Set any supported API key
export OPENAI_API_KEY="sk-..."

# Generate a single Claude Code skill (default)
npx prd-to-skill ./my-feature-prd.pdf

# Split into multiple focused skills (tech stack, business rules, architecture, etc.)
npx prd-to-skill split ./my-feature-prd.pdf

# Generate a Cursor rule
npx prd-to-skill ./my-feature-prd.pdf --target cursor

# Generate an AGENTS.md for OpenAI Codex CLI
npx prd-to-skill ./my-feature-prd.pdf --target codex

# Generate for every tool at once
for t in claude cursor codex copilot windsurf aider; do
  npx prd-to-skill ./my-feature-prd.pdf --target $t
done
```

## Supported AI Coding Tools

| Tool           | Flag                        | Output Path                                   | Format                      |
| -------------- | --------------------------- | --------------------------------------------- | --------------------------- |
| Claude Code    | `--target claude` (default) | `.claude/commands/<name>.md`                  | Markdown + YAML frontmatter |
| Cursor         | `--target cursor`           | `.cursor/rules/<name>.mdc`                    | MDC + YAML frontmatter      |
| OpenAI Codex   | `--target codex`            | `./AGENTS.md`                                 | Plain Markdown              |
| GitHub Copilot | `--target copilot`          | `.github/instructions/<name>.instructions.md` | Markdown + YAML frontmatter |
| Windsurf       | `--target windsurf`         | `.windsurf/rules/<name>.md`                   | Plain Markdown              |
| Aider          | `--target aider`            | `./CONVENTIONS.md`                            | Plain Markdown              |

Output directories are created automatically if they don't exist.

## Supported LLM Providers

The tool auto-detects your provider from whichever API key is set (checked in this order):

| Provider  | Env Var             | Default Model                |
| --------- | ------------------- | ---------------------------- |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-4-6-20250217` |
| OpenAI    | `OPENAI_API_KEY`    | `gpt-5.4`                    |
| Google    | `GOOGLE_API_KEY`    | `gemini-2.5-flash`           |
| Mistral   | `MISTRAL_API_KEY`   | `mistral-large-latest`       |

No SDK dependencies — all LLM calls use lightweight raw HTTP adapters, keeping `npx` installs fast.

Run `prd-to-skill help <provider>` for setup instructions and links to official docs for any provider.

## Usage

```bash
prd-to-skill <file> [options]
```

### Options

| Flag                       | Description                                                              | Default               |
| -------------------------- | ------------------------------------------------------------------------ | --------------------- |
| `-t, --target <target>`    | Target tool: `claude`, `cursor`, `codex`, `copilot`, `windsurf`, `aider` | `claude`              |
| `-p, --provider <name>`    | LLM provider: `openai`, `anthropic`, `google`, `mistral`                 | Auto-detected         |
| `-m, --model <model>`      | Model name                                                               | Provider default      |
| `-o, --output <path>`      | Output file path (overrides default)                                     | Target-specific       |
| `-n, --name <name>`        | Skill/rule name                                                          | Derived from filename |
| `-d, --description <text>` | Description for frontmatter                                              | Generated by LLM      |
| `--max-tokens <number>`    | Max output tokens                                                        | `4096`                |
| `-v, --verbose`            | Show extraction and API details                                          |                       |

### Commands

| Command                        | Description                                             |
| ------------------------------ | ------------------------------------------------------- |
| `prd-to-skill split <file>`    | Split PRD into multiple focused skill files             |
| `prd-to-skill help`            | Detailed help with all targets, providers, and examples |
| `prd-to-skill help <provider>` | Setup guide with docs link for a specific provider      |

### Examples

```bash
# Convert a PDF PRD into a Claude Code skill using Anthropic
prd-to-skill ./prd.pdf --provider anthropic

# Convert a Word doc into a Cursor rule
prd-to-skill ./prd.docx --target cursor --name auth-feature

# Use Google Gemini with a custom model
prd-to-skill ./prd.pdf --provider google --model gemini-2.5-pro

# Custom output path
prd-to-skill ./prd.pdf --output .claude/commands/auth.md

# Increase token limit for large PRDs
prd-to-skill ./prd.pdf --max-tokens 8192
```

## Splitting a PRD into Multiple Skills

The `split` command analyzes your PRD with AI and automatically determines the right set of focused skill files to generate — one per topic area.

```bash
prd-to-skill split ./my-feature-prd.pdf
```

### What it generates

Given a PRD, the LLM identifies the relevant categories (e.g. 3-7 depending on the document) and generates a separate skill file for each. Common categories include:

| Category                  | What it covers                                                     |
| ------------------------- | ------------------------------------------------------------------ |
| `tech-stack`              | Frameworks, libraries, dependencies, version constraints           |
| `business-rules`          | Domain logic, validation rules, edge cases                         |
| `architecture`            | File structure, component organization, naming conventions         |
| `functional-requirements` | Core features, user flows, expected behaviors, acceptance criteria |
| `ui-ux`                   | Layout, interaction patterns, responsive behavior                  |
| `api-contracts`           | Endpoints, request/response shapes, authentication                 |
| `data-models`             | Schemas, data structures, relationships                            |

The categories are determined per-PRD — only topics with sufficient content are generated.

### Output files

All files are written to the same directory as the single-file command (e.g. `.claude/commands/` for Claude Code):

```
.claude/commands/
  my-feature-tech-stack.md
  my-feature-business-rules.md
  my-feature-architecture.md
  my-feature-functional-requirements.md
  my-feature-index.md          ← index listing all skills with descriptions
```

### Split command options

```bash
prd-to-skill split <file> [options]
```

| Flag                    | Description                                              | Default               |
| ----------------------- | -------------------------------------------------------- | --------------------- |
| `-t, --target <target>` | Target tool: `claude`, `cursor`, `copilot`, `windsurf`   | `claude`              |
| `-p, --provider <name>` | LLM provider: `openai`, `anthropic`, `google`, `mistral` | Auto-detected         |
| `-m, --model <model>`   | Model name                                               | Provider default      |
| `-n, --name <name>`     | Base name for generated files                            | Derived from filename |
| `--max-tokens <number>` | Max output tokens per skill file                         | `4096`                |
| `-v, --verbose`         | Show extraction and API details                          |                       |

> **Note:** `codex` and `aider` targets are not supported for `split` because they use fixed output filenames (`AGENTS.md` / `CONVENTIONS.md`). Use the default command for those targets.

### Split examples

```bash
# Split a PRD into focused Claude Code skills
prd-to-skill split ./prd.pdf

# Split into Cursor rules
prd-to-skill split ./prd.pdf --target cursor

# Use a specific provider and model
prd-to-skill split ./prd.pdf --provider anthropic --model claude-opus-4-6

# Custom base name for output files
prd-to-skill split ./prd.pdf --name auth-feature
```

## How It Works

### Default command

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  PDF / DOCX  │────▶│   Extract    │────▶│   LLM Call   │────▶│  Write File  │
│   (input)    │     │    Text      │     │  (any model) │     │ (target fmt) │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

1. **Extracts text** from your PDF or Word document
2. **Detects issues** — warns if the document appears truncated or incomplete
3. **Filters intelligently** — keeps requirements, architecture, business rules, and acceptance criteria; strips timelines, stakeholders, and budgets
4. **Generates with AI** — sends to your chosen LLM with a target-specific prompt that produces the correct file format
5. **Validates output** — detects if the LLM output was cut off and suggests fixes (increase `--max-tokens`, use a larger model, or split the PRD)
6. **Writes the file** to the right directory for your chosen tool

### Split command

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────────────┐     ┌───────────────┐
│  PDF / DOCX  │────▶│   Extract    │────▶│  Plan Call   │────▶│  Parallel LLM Calls │────▶│  Write Files  │
│   (input)    │     │    Text      │     │  (identify   │     │  (one per category) │     │  + Index File │
└──────────────┘     └──────────────┘     │  categories) │     └─────────────────────┘     └───────────────┘
                                          └──────────────┘
```

1. **Extracts text** from your PDF or Word document
2. **Plans categories** — makes one LLM call to analyze the PRD and identify 3-7 relevant skill categories
3. **Generates skills in parallel** — sends one LLM call per category, each focused on only that topic
4. **Writes skill files** — one file per category, all in the target tool's directory
5. **Writes an index file** — a summary listing every generated skill with descriptions and links

## Common Use Cases

- **Starting a new feature** — convert the PRD to a Claude Code skill so Claude has full context when implementing
- **Onboarding AI to a project** — generate Cursor rules or Copilot instructions from existing specs so the AI follows your project's requirements
- **Multi-tool teams** — generate the same PRD as instructions for every AI tool your team uses with a single loop
- **Keeping AI context up to date** — re-run whenever the PRD changes to regenerate the instruction file

## Troubleshooting

### Output is incomplete

The LLM hit its token limit. Try:

```bash
prd-to-skill ./prd.pdf --max-tokens 8192
```

Or use a model with a larger output window, or split your PRD into smaller documents.

### Document appears truncated

The tool detected that your PDF/DOCX ends mid-sentence. Check that the source document is complete. The tool will still generate output from what's available and list what appears to be missing.

### No API key found

Set one of the supported environment variables:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."  # or
export OPENAI_API_KEY="sk-..."         # or
export GOOGLE_API_KEY="AI..."          # or
export MISTRAL_API_KEY="..."
```

Run `prd-to-skill help <provider>` for step-by-step setup.

## Contributing

Contributions are welcome! Please open an issue or pull request on [GitHub](https://github.com/leonoronhas/prd-to-skill).

## License

MIT
