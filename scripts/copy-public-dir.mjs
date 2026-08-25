import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

const copies = [
  ["public", "public"],
  ["style.css", "style.css"],
  ["script.js", "script.js"],
  ["tech-activation.js", "tech-activation.js"],
  ["analytics/client", "analytics/client"],
  ["projects", "projects"],
  ["tech", "tech"]
];

await mkdir(dist, { recursive: true });

for (const [sourceName, targetName] of copies) {
  const source = path.join(root, sourceName);
  const target = path.join(dist, targetName);

  await mkdir(path.dirname(target), { recursive: true });
  await rm(target, { force: true, recursive: true });
  await cp(source, target, { recursive: true });
}
