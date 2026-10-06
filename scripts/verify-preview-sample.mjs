import fs from "node:fs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import vm from "node:vm";

const html = fs.readFileSync(
  new URL("../examples/preview-mode/index.html", import.meta.url),
  "utf8",
);
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(
  (match) => match[1],
);
for (const script of scripts) {
  if (!script.trim() || script.trim().startsWith("{")) continue;
  new vm.Script(script);
  const hash = createHash("sha256").update(script).digest("base64");
  assert(html.includes(`'sha256-${hash}'`), "CSP must allow each script");
}
const code = scripts.find((script) => script.includes("function mn()"));
const start = code.indexOf("function mn()");
const end = code.indexOf("}function ", start) + 1;
const uuid = code.slice(start, end);
assert(uuid.includes("crypto.getRandomValues"));
assert(!uuid.includes("Math.random"));
const context = vm.createContext({ crypto, Uint32Array });
vm.runInContext(
  'const Nt=Array.from({length:256},(_,i)=>i.toString(16).padStart(2,"0"));' + uuid,
  context,
);
const ids = new Set();
for (let index = 0; index < 100; index++) {
  const id = vm.runInContext("mn()", context);
  assert.match(
    id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  ids.add(id);
}
assert.equal(ids.size, 100);
console.log("Sample script syntax, CSP hashes and cryptographic UUID checks passed");
