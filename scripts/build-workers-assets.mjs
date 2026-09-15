import { cp, mkdir, readdir, rm } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const output = new URL("dist/", root);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

// A separate public directory keeps Wrangler's own state out of its asset watcher.
const files = [
  "index.html", "verify.html", "app.mjs", "domain.mjs", "styles.css",
  "_headers", "_redirects", "assets", "docs/architecture",
  ...(await readdir(new URL("submission/", root)))
    .filter((file) => /\.(jpg|png|html)$/.test(file))
    .map((file) => `submission/${file}`),
];

for (const file of files) {
  await cp(new URL(file, root), new URL(file, output), { recursive: true });
}
