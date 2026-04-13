import { describe, it, expect } from "vitest";
import { buildMessages } from "../src/prompt.js";
import { getTarget } from "../src/targets.js";

describe("buildMessages", () => {
  const claude = getTarget("claude");
  const cursor = getTarget("cursor");

  it("returns system and user messages", () => {
    const messages = buildMessages("Some PRD content", "my-feature", claude);
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");
  });

  it("includes PRD text in user message", () => {
    const messages = buildMessages("Requirements here", "test-skill", claude);
    expect(messages[1].content).toContain("Requirements here");
    expect(messages[1].content).toContain("<prd>");
  });

  it("includes skill name in user message", () => {
    const messages = buildMessages("content", "my-skill", claude);
    expect(messages[1].content).toContain("Name: my-skill");
  });

  it("includes description when provided", () => {
    const messages = buildMessages(
      "content",
      "my-skill",
      claude,
      "Use when building auth",
    );
    expect(messages[1].content).toContain("Description: Use when building auth");
  });

  it("omits description line when not provided", () => {
    const messages = buildMessages("content", "my-skill", claude);
    expect(messages[1].content).not.toContain("Description:");
  });

  it("includes target format instructions in system prompt", () => {
    const messages = buildMessages("content", "my-skill", cursor);
    expect(messages[0].content).toContain("cursor");
    expect(messages[0].content).toContain("alwaysApply");
  });

  it("includes claude format instructions for claude target", () => {
    const messages = buildMessages("content", "my-skill", claude);
    expect(messages[0].content).toContain("claude");
    expect(messages[0].content).toContain("name: <kebab-case-name>");
  });
});
