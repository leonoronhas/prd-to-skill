import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import type { Target } from "./targets.js";
import { getDefaultFilename } from "./targets.js";

export const deriveSkillName = (filePath: string): string =>
  basename(filePath)
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const deriveOutputPath = (
  name: string,
  target: Target,
  outputFlag?: string,
): string => {
  if (outputFlag) return resolve(outputFlag);
  const dir = target.outputDir(process.cwd());
  const filename = getDefaultFilename(target, name);
  return join(dir, filename);
};

export const writeSkillFile = async (
  content: string,
  outputPath: string,
): Promise<void> => {
  const normalized = content.replace(/\r\n/g, "\n").trim() + "\n";
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, normalized, "utf-8");
};
