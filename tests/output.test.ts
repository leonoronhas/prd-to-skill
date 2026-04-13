import { describe, it, expect } from "vitest";
import { deriveSkillName, deriveOutputPath } from "../src/output.js";
import { getTarget } from "../src/targets.js";

describe("deriveSkillName", () => {
  it("converts filename to kebab-case", () => {
    expect(deriveSkillName("My Feature PRD.pdf")).toBe("my-feature-prd");
  });

  it("strips extension", () => {
    expect(deriveSkillName("auth-system.docx")).toBe("auth-system");
  });

  it("handles special characters", () => {
    expect(deriveSkillName("PRD_v2 (final).pdf")).toBe("prd-v2-final");
  });
});

describe("deriveOutputPath", () => {
  it("uses output flag when provided", () => {
    const claude = getTarget("claude");
    const result = deriveOutputPath("test", claude, "/tmp/out.md");
    expect(result).toBe("/tmp/out.md");
  });

  it("defaults to .claude/commands/ for claude target", () => {
    const claude = getTarget("claude");
    const result = deriveOutputPath("my-skill", claude);
    expect(result).toContain(".claude/commands/my-skill.md");
  });

  it("defaults to .cursor/rules/ for cursor target", () => {
    const cursor = getTarget("cursor");
    const result = deriveOutputPath("my-rule", cursor);
    expect(result).toContain(".cursor/rules/my-rule.mdc");
  });

  it("uses AGENTS.md for codex target", () => {
    const codex = getTarget("codex");
    const result = deriveOutputPath("anything", codex);
    expect(result).toContain("AGENTS.md");
  });

  it("uses CONVENTIONS.md for aider target", () => {
    const aider = getTarget("aider");
    const result = deriveOutputPath("anything", aider);
    expect(result).toContain("CONVENTIONS.md");
  });

  it("defaults to .windsurf/rules/ for windsurf target", () => {
    const windsurf = getTarget("windsurf");
    const result = deriveOutputPath("my-rule", windsurf);
    expect(result).toContain(".windsurf/rules/my-rule.md");
  });

  it("defaults to .github/instructions/ for copilot target", () => {
    const copilot = getTarget("copilot");
    const result = deriveOutputPath("my-rule", copilot);
    expect(result).toContain(".github/instructions/my-rule.instructions.md");
  });
});
