#!/usr/bin/env node
// Replaces openapi.json with the spec the API publishes, keys sorted so that a diff shows only
// what changed. Prints "changed" or "unchanged" on its last line.
//
// Usage: node scripts/update-spec.mjs [url]   (default: $REDUCK_OPENAPI_URL, else reduck.ai)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const url = process.argv[2] || process.env.REDUCK_OPENAPI_URL || "https://reduck.ai/api/openapi.json";
const out = fileURLToPath(new URL("../openapi.json", import.meta.url));

const res = await fetch(url, { headers: { accept: "application/json" } });
if (!res.ok) {
	console.error(`GET ${url} answered ${res.status}`);
	process.exit(1);
}
const spec = await res.json();
if (typeof spec.openapi !== "string" || typeof spec.paths !== "object") {
	console.error(`${url} did not answer an OpenAPI document`);
	process.exit(1);
}

const sortKeys = (v) =>
	Array.isArray(v)
		? v.map(sortKeys)
		: v && typeof v === "object"
			? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]))
			: v;
const next = JSON.stringify(sortKeys(spec), null, 2) + "\n";

let prev = "";
try {
	prev = readFileSync(out, "utf8");
} catch {}
if (prev === next) {
	console.log("unchanged");
} else {
	writeFileSync(out, next);
	console.log("changed");
}
