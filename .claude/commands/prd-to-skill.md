---
name: prd-to-skill
description: Convert a PRD (PDF or DOCX) into AI coding assistant instruction files for Claude Code, Cursor, Copilot, Windsurf, Codex, or Aider.
---

Guide the user through converting a PRD document into AI coding assistant instruction files using `npx prd-to-skill`. Ask one question at a time. At the end, show the full command and run it.

## Step 1 — File

Ask: "What's the path to your PRD file? (PDF or DOCX)"

## Step 2 — Target

Present these options and ask which tool they're generating for:

| #   | Target               | Output location                               |
| --- | -------------------- | --------------------------------------------- |
| 1   | **claude** (default) | `.claude/commands/<name>.md`                  |
| 2   | **cursor**           | `.cursor/rules/<name>.mdc`                    |
| 3   | **copilot**          | `.github/instructions/<name>.instructions.md` |
| 4   | **windsurf**         | `.windsurf/rules/<name>.md`                   |
| 5   | **codex**            | `./AGENTS.md`                                 |
| 6   | **aider**            | `./CONVENTIONS.md`                            |

## Step 3 — Single file or split (skip for codex and aider)

If the target is `codex` or `aider`, skip this step — they only support a single output file.

Otherwise ask: "Do you want a **single skill file** (one complete instruction file) or **multiple focused files** that split the PRD by topic — tech stack, business rules, architecture, and so on? Split lets you load only what's relevant to your current task."

## Step 4 — Name (optional)

Ask: "What name should the output use? (Leave blank to derive from the filename)"

If they skip or say nothing meaningful, omit `--name`.

## Step 5 — Confirm and run

Show the exact command you are about to run, for example:

```
npx prd-to-skill ./my-prd.pdf --target cursor --name auth-feature
npx prd-to-skill split ./my-prd.pdf --target claude
```

Then say: "This will use whichever API key you have set (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, or `MISTRAL_API_KEY`). Ready to go?"

Once confirmed, run the command with `!npx prd-to-skill ...`.
