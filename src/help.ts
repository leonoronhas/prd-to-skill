interface ProviderHelp {
  name: string;
  envVar: string;
  docsUrl: string;
  steps: string;
}

const providers: Record<string, ProviderHelp> = {
  openai: {
    name: "OpenAI",
    envVar: "OPENAI_API_KEY",
    docsUrl: "https://platform.openai.com/api-keys",
    steps: `1. Sign up or log in at platform.openai.com
2. Go to API Keys and create a new secret key
3. Export it:  export OPENAI_API_KEY="sk-..."`,
  },
  anthropic: {
    name: "Anthropic",
    envVar: "ANTHROPIC_API_KEY",
    docsUrl: "https://console.anthropic.com/settings/keys",
    steps: `1. Sign up or log in at console.anthropic.com
2. Go to Settings > API Keys and create a key
3. Export it:  export ANTHROPIC_API_KEY="sk-ant-..."`,
  },
  google: {
    name: "Google (Gemini)",
    envVar: "GOOGLE_API_KEY",
    docsUrl: "https://aistudio.google.com/apikey",
    steps: `1. Go to Google AI Studio
2. Click "Get API key" and create one
3. Export it:  export GOOGLE_API_KEY="AI..."`,
  },
  mistral: {
    name: "Mistral",
    envVar: "MISTRAL_API_KEY",
    docsUrl: "https://console.mistral.ai/api-keys",
    steps: `1. Sign up or log in at console.mistral.ai
2. Go to API Keys and create a new key
3. Export it:  export MISTRAL_API_KEY="..."`,
  },
};

const GENERAL_HELP = `
prd-to-skill — Convert PRD documents into AI coding assistant instruction files.

Takes a PDF or Word (.docx) PRD and generates a ready-to-use instruction file
for your AI coding tool of choice.

QUICK START:
  export OPENAI_API_KEY="sk-..."
  npx prd-to-skill ./my-prd.pdf

SUPPORTED TARGETS:
  claude     Claude Code skill        → .claude/commands/<name>.md
  cursor     Cursor rule              → .cursor/rules/<name>.mdc
  codex      OpenAI Codex CLI         → ./AGENTS.md
  copilot    GitHub Copilot           → .github/instructions/<name>.instructions.md
  windsurf   Windsurf rule            → .windsurf/rules/<name>.md
  aider      Aider conventions        → ./CONVENTIONS.md

SUPPORTED PROVIDERS:
  openai     OPENAI_API_KEY           Default: gpt-5.4
  anthropic  ANTHROPIC_API_KEY        Default: claude-sonnet-4-6-20250217
  google     GOOGLE_API_KEY           Default: gemini-2.5-flash
  mistral    MISTRAL_API_KEY          Default: mistral-large-latest

The provider is auto-detected from whichever API key you have set.
For provider-specific setup, run:  prd-to-skill help <provider>

EXAMPLES:
  prd-to-skill ./prd.pdf
  prd-to-skill ./prd.docx --target cursor
  prd-to-skill ./prd.pdf --provider anthropic --model claude-sonnet-4-6-20250217
  prd-to-skill ./prd.pdf -n auth-feature -o .claude/commands/auth.md
`;

export const printHelp = (provider?: string): void => {
  if (!provider) {
    console.log(GENERAL_HELP.trim());
    return;
  }

  const p = providers[provider.toLowerCase()];
  if (!p) {
    console.error(
      `Unknown provider "${provider}". Available: ${Object.keys(providers).join(", ")}`,
    );
    process.exit(1);
  }

  console.log(
    `
${p.name} Setup
${"=".repeat(p.name.length + 6)}

Env var:  ${p.envVar}
Docs:     ${p.docsUrl}

${p.steps}

Then run:
  prd-to-skill ./my-prd.pdf --provider ${provider.toLowerCase()}
`.trim(),
  );
};
