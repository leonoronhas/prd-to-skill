import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectProvider } from "../src/providers/detect.js";

describe("detectProvider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.MISTRAL_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws when no API key is set", () => {
    expect(() => detectProvider()).toThrow("No API key found");
  });

  it("detects anthropic first when multiple keys set", () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    process.env.OPENAI_API_KEY = "sk-test";
    const provider = detectProvider();
    expect(provider.name).toBe("anthropic");
  });

  it("detects openai when only openai key set", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const provider = detectProvider();
    expect(provider.name).toBe("openai");
  });

  it("uses explicit provider when specified", () => {
    process.env.GOOGLE_API_KEY = "goog-test";
    const provider = detectProvider("google");
    expect(provider.name).toBe("google");
  });

  it("throws on unknown provider", () => {
    expect(() => detectProvider("unknown")).toThrow("Unknown provider");
  });

  it("throws when explicit provider has no key", () => {
    expect(() => detectProvider("openai")).toThrow("requires OPENAI_API_KEY");
  });
});
