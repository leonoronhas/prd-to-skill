import { describe, it, expect } from "vitest";
import { getTarget, getDefaultFilename, TARGET_NAMES } from "../src/targets.js";

describe("getTarget", () => {
  it("returns all supported targets", () => {
    expect(TARGET_NAMES).toEqual([
      "claude",
      "cursor",
      "codex",
      "copilot",
      "windsurf",
      "aider",
    ]);
  });

  it("throws on unknown target", () => {
    expect(() => getTarget("unknown")).toThrow("Unknown target");
  });

  it("returns correct target for each name", () => {
    for (const name of TARGET_NAMES) {
      const target = getTarget(name);
      expect(target.name).toBe(name);
      expect(target.extension).toBeTruthy();
      expect(target.formatInstructions).toBeTruthy();
    }
  });
});

describe("getDefaultFilename", () => {
  it("returns AGENTS.md for codex", () => {
    expect(getDefaultFilename(getTarget("codex"), "anything")).toBe("AGENTS.md");
  });

  it("returns CONVENTIONS.md for aider", () => {
    expect(getDefaultFilename(getTarget("aider"), "anything")).toBe("CONVENTIONS.md");
  });

  it("returns name.mdc for cursor", () => {
    expect(getDefaultFilename(getTarget("cursor"), "my-rule")).toBe("my-rule.mdc");
  });

  it("returns name.md for claude", () => {
    expect(getDefaultFilename(getTarget("claude"), "my-skill")).toBe("my-skill.md");
  });

  it("returns name.instructions.md for copilot", () => {
    expect(getDefaultFilename(getTarget("copilot"), "my-rule")).toBe(
      "my-rule.instructions.md",
    );
  });
});
