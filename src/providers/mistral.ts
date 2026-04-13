import type { CompleteFn, LLMConfig, LLMMessage } from "./types.js";

export const complete: CompleteFn = async (
  config: LLMConfig,
  messages: LLMMessage[],
): Promise<string> => {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mistral API error (${res.status}): ${body}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0].message.content;
};
