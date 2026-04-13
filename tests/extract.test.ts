import { describe, it, expect } from "vitest";
import { detectTruncation, extractText } from "../src/extract.js";
import { resolve } from "node:path";

describe("extractText", () => {
  it("throws on missing file", async () => {
    await expect(extractText("nonexistent.pdf")).rejects.toThrow("File not found");
  });

  it("throws on unsupported extension", async () => {
    await expect(extractText(resolve(__dirname, "../package.json"))).rejects.toThrow(
      "Unsupported file type",
    );
  });
});

describe("detectTruncation", () => {
  it("returns true for text ending mid-sentence", () => {
    expect(detectTruncation("implement tools within the admin panel to create and")).toBe(
      true,
    );
  });

  it("returns true for text ending with a comma", () => {
    expect(detectTruncation("some list item,")).toBe(true);
  });

  it("returns true for text ending with a colon expecting more content", () => {
    expect(detectTruncation("The following options:")).toBe(true);
  });

  it("returns true for text ending with a dangling conjunction", () => {
    expect(detectTruncation("adding new states and")).toBe(true);
  });

  it("returns true for text ending mid-parenthetical", () => {
    expect(detectTruncation("geographic markets (e.g.,")).toBe(true);
  });

  it("returns false for text ending with a period", () => {
    expect(detectTruncation("This is a complete sentence.")).toBe(false);
  });

  it("returns false for text ending with a closing parenthesis", () => {
    expect(detectTruncation("(e.g., Idaho and Utah)")).toBe(false);
  });

  it("returns false for text ending with an exclamation mark", () => {
    expect(detectTruncation("Build it now!")).toBe(false);
  });

  it("returns false for empty text", () => {
    expect(detectTruncation("")).toBe(false);
  });
});
