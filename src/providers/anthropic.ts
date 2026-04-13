import type { CompleteFn, LLMConfig, LLMMessage } from "./types.js";

export const complete: CompleteFn = async (
  config: LLMConfig,
  messages: LLMMessage[],
): Promise<string> => {
  const systemMsg = messages.find((m) => m.role === "system");
  const nonSystemMsgs = messages.filter((m) => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      system: systemMsg?.content ?? "",
      messages: nonSystemMsgs.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${body}`);
  }

  const data = (await res.json()) as {
    content: { type: string; text: string }[];
  };
  return data.content[0].text;
};
