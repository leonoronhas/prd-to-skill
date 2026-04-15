import { describe, it, expect } from "vitest";
import {
  SPLIT_UNSUPPORTED_TARGETS,
  parseSkillPlan,
  buildIndexContent,
} from "../src/split.js";
import { getTarget } from "../src/targets.js";

describe("SPLIT_UNSUPPORTED_TARGETS", () => {
  it("includes codex and aider", () => {
    expect(SPLIT_UNSUPPORTED_TARGETS).toContain("codex");
    expect(SPLIT_UNSUPPORTED_TARGETS).toContain("aider");
  });
});

describe("parseSkillPlan", () => {
  it("parses a valid JSON array", () => {
    const input = JSON.stringify([
      { name: "tech-stack", description: "Use when selecting libraries." },
      { name: "api-contracts", description: "Use when defining endpoints." },
    ]);
    const result = parseSkillPlan(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: "tech-stack",
      description: "Use when selecting libraries.",
    });
    expect(result[1]).toEqual({
      name: "api-contracts",
      description: "Use when defining endpoints.",
    });
  });

  it("strips ```json ... ``` markdown fences before parsing", () => {
    const input =
      '```json\n[{"name":"auth","description":"Use when authenticating."}]\n```';
    const result = parseSkillPlan(input);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("auth");
  });

  it("strips plain ``` ... ``` fences before parsing", () => {
    const input = '```\n[{"name":"data","description":"Use when modeling data."}]\n```';
    const result = parseSkillPlan(input);
    expect(result[0].name).toBe("data");
  });

  it("throws when LLM returns a non-array", () => {
    expect(() => parseSkillPlan('{"name":"x"}')).toThrow(
      "LLM returned non-array for skill plan",
    );
  });

  it("throws when an item is not an object", () => {
    expect(() => parseSkillPlan('["not-an-object"]')).toThrow("Invalid skill plan item");
  });

  it("throws when an item is missing name or description", () => {
    expect(() => parseSkillPlan('[{"name":"only-name"}]')).toThrow(
      "Each skill plan item must have string name and description fields",
    );
  });

  it("throws when name is not a string", () => {
    expect(() => parseSkillPlan('[{"name":42,"description":"desc"}]')).toThrow(
      "Each skill plan item must have string name and description fields",
    );
  });

  it("throws on invalid JSON", () => {
    expect(() => parseSkillPlan("not json")).toThrow();
  });
});

describe("buildIndexContent", () => {
  const skills = [
    { name: "tech-stack", description: "Use when choosing libraries." },
    { name: "api-contracts", description: "Use when defining endpoints." },
  ];
  const filenames = ["my-prd-tech-stack.md", "my-prd-api-contracts.md"];

  it("generates claude frontmatter with name and description", () => {
    const content = buildIndexContent("my-prd", skills, getTarget("claude"), filenames);
    expect(content).toContain("name: my-prd-index");
    expect(content).toContain("description: Use when you need an overview");
  });

  it("generates cursor frontmatter with description and globs fields", () => {
    const content = buildIndexContent("my-prd", skills, getTarget("cursor"), [
      "my-prd-tech-stack.mdc",
      "my-prd-api-contracts.mdc",
    ]);
    expect(content).toContain("description: Index of all my-prd skill files");
    expect(content).toContain("globs:");
    expect(content).toContain("alwaysApply: false");
  });

  it("generates copilot frontmatter with applyTo field", () => {
    const content = buildIndexContent("my-prd", skills, getTarget("copilot"), [
      "my-prd-tech-stack.instructions.md",
      "my-prd-api-contracts.instructions.md",
    ]);
    expect(content).toContain("description: Index of all my-prd skill files");
    expect(content).toContain('applyTo: "**"');
  });

  it("generates windsurf index without YAML frontmatter", () => {
    const content = buildIndexContent("my-prd", skills, getTarget("windsurf"), filenames);
    expect(content).not.toContain("---");
    expect(content).toContain("# my-prd — Skills Index");
  });

  it("lists all skills with links and descriptions", () => {
    const content = buildIndexContent("my-prd", skills, getTarget("claude"), filenames);
    expect(content).toContain("[tech-stack](./my-prd-tech-stack.md)");
    expect(content).toContain("Use when choosing libraries.");
    expect(content).toContain("[api-contracts](./my-prd-api-contracts.md)");
    expect(content).toContain("Use when defining endpoints.");
  });

  it("includes the skill count in the body", () => {
    const content = buildIndexContent("my-prd", skills, getTarget("claude"), filenames);
    expect(content).toContain("Generated 2 focused skill files");
  });
});
