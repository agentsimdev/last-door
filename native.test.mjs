import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

test("the native test bench sends object input and accepts WebMCP results", async () => {
  // Exercise the real call helper without booting the page's unrelated DOM UI.
  const source = await readFile(new URL("./app.mjs", import.meta.url), "utf8");
  const start = source.indexOf("async function callNative(");
  const end = source.indexOf("\nasync function ", start + 1);
  assert(start >= 0 && end > start, "Native call helper must be present");
  const tool = { name: "get_run_receipt" };
  for (const raw of ['{"status":"passed"}', { status: "passed" }]) {
    const trace = [];
    let calls = 0;
    const call = runInNewContext(`${source.slice(start, end)}\ncallNative`, {
      waitForNativeTool: async (name) => { assert.equal(name, tool.name); return tool; },
      document: {
        modelContext: {
          executeTool: async (selected, input) => {
            calls++;
            assert.equal(selected, tool);
            assert(input !== null && typeof input === "object" && !Array.isArray(input),
              "WebMCP executeTool requires an object input");
            assert.equal(Object.keys(input).length, 0);
            return raw;
          },
        },
        createElement: () => ({}),
      },
      nativeTrace: { append: (item) => trace.push(item.textContent) },
    });
    assert.equal((await call(tool.name)).status, "passed");
    assert.equal(calls, 1, "A native call must not be retried");
    assert.deepEqual(trace, ['get_run_receipt {"status":"passed"}']);
  }
});
