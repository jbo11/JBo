import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "public");
const target = path.join(root, "dist", "public");

await rm(target, { force: true, recursive: true });
await mkdir(path.dirname(target), { recursive: true });
await cp(source, target, { recursive: true });
