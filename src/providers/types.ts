export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export type CompleteFn = (config: LLMConfig, messages: LLMMessage[]) => Promise<string>;

export interface Provider {
  name: string;
  envVar: string;
  defaultModel: string;
  complete: CompleteFn;
}
