import type { Provider } from "./types.js";
import { complete as openaiComplete } from "./openai.js";
import { complete as anthropicComplete } from "./anthropic.js";
import { complete as googleComplete } from "./google.js";
import { complete as mistralComplete } from "./mistral.js";

const providers: Provider[] = [
  {
    name: "anthropic",
    envVar: "ANTHROPIC_API_KEY",
    defaultModel: "claude-sonnet-4-20250514",
    complete: anthropicComplete,
  },
  {
    name: "openai",
    envVar: "OPENAI_API_KEY",
    defaultModel: "gpt-4o",
    complete: openaiComplete,
  },
  {
    name: "google",
    envVar: "GOOGLE_API_KEY",
    defaultModel: "gemini-2.0-flash",
    complete: googleComplete,
  },
  {
    name: "mistral",
    envVar: "MISTRAL_API_KEY",
    defaultModel: "mistral-large-latest",
    complete: mistralComplete,
  },
];

export const detectProvider = (explicit?: string): Provider => {
  if (explicit) {
    const provider = providers.find((p) => p.name === explicit);
    if (!provider) {
      throw new Error(
        `Unknown provider "${explicit}". Supported: ${providers.map((p) => p.name).join(", ")}`,
      );
    }
    if (!process.env[provider.envVar]) {
      throw new Error(`Provider "${explicit}" requires ${provider.envVar} to be set.`);
    }
    return provider;
  }

  for (const provider of providers) {
    if (process.env[provider.envVar]) {
      return provider;
    }
  }

  throw new Error(
    `No API key found. Set one of: ${providers.map((p) => p.envVar).join(", ")}`,
  );
};

export const getApiKey = (provider: Provider): string => {
  const key = process.env[provider.envVar];
  if (!key) {
    throw new Error(`${provider.envVar} is not set.`);
  }
  return key;
};
