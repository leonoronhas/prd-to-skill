import { describe, it, expect } from "vitest";
import { extractText } from "../src/extract.js";
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
