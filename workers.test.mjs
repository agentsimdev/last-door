import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import test from "node:test";

test("Workers serves the demo, security headers and only public assets", { timeout: 30_000 }, async () => {
  const server = spawn(process.execPath, [
    "node_modules/wrangler/bin/wrangler.js", "dev", "--local", "--config", "wrangler.jsonc",
  ], { env: { ...process.env, CI: "1", WRANGLER_SEND_METRICS: "false" }, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  let timeout;
  const ready = new Promise((resolve, reject) => {
    timeout = setTimeout(() => reject(new Error(`Workers did not become ready: ${output}`)), 10_000);
    const collect = (chunk) => {
      output += chunk;
      if (output.includes("Ready on http://127.0.0.1:8789")) resolve();
    };
    server.stdout.on("data", collect);
    server.stderr.on("data", collect);
    server.once("error", reject);
    server.once("exit", () => reject(new Error(`Workers exited before ready: ${output}`)));
  });
  try {
    await ready;
    const files = [
      ["/", "index.html"], ["/?verify=1", "index.html"], ["/verify.html", "verify.html"],
      ["/app.mjs", "app.mjs"], ["/domain.mjs", "domain.mjs"], ["/styles.css", "styles.css"],
      ["/assets/agentsim-logo-mark.svg", "assets/agentsim-logo-mark.svg"],
      ["/docs/architecture/last-door-system.html", "docs/architecture/last-door-system.html"],
      ["/docs/architecture/last-door-authority-lifecycle.png", "docs/architecture/last-door-authority-lifecycle.png"],
      ["/submission/live-policy-lab.jpg", "submission/live-policy-lab.jpg"],
    ];
    const headers = [
      ["X-Content-Type-Options", "nosniff"],
      ["Referrer-Policy", "strict-origin-when-cross-origin"],
      ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
    ];
    for (const [path, file] of files) {
      const response = await fetch(`http://127.0.0.1:8789${path}`, { redirect: "manual" });
      assert.equal(response.status, 200, path);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(file), path);
      for (const [key, value] of headers) assert.equal(response.headers.get(key), value, `${path}: ${key}`);
      if (file.endsWith(".mjs")) assert.match(response.headers.get("Content-Type"), /javascript/);
      if (file.endsWith(".html")) assert.match(response.headers.get("Content-Type"), /text\/html/);
      if (file.endsWith(".css")) assert.match(response.headers.get("Content-Type"), /text\/css/);
    }
    for (const path of ["/missing", "/package.json", "/README.md", "/.git/config", "/.env", "/node_modules/wrangler/package.json", "/wrangler.jsonc", "/workers.test.mjs", "/_headers", "/_redirects"]) {
      const response = await fetch(`http://127.0.0.1:8789${path}`, { redirect: "manual" });
      assert.equal(response.status, 404, path);
    }
  } finally {
    clearTimeout(timeout);
    if (server.exitCode === null) {
      const exited = once(server, "exit");
      server.kill("SIGTERM");
      await exited;
    }
  }
});
