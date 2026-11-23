import { defineConfig } from "@hey-api/openapi-ts";

// openapi.json is the spec reduck.ai publishes at /api/openapi.json, committed so that every
// change to the API this package exposes is a reviewable diff. src/generated is git-ignored.
export default defineConfig({
	input: "./openapi.json",
	output: { path: "src/generated", clean: true, importFileExtension: ".js" },
	// `enums: "javascript"` makes each named enum of the spec a const object besides its type, so a
	// caller can read its values at run time (e.g. the managed regions in ManagedRegion).
	plugins: [
		"@hey-api/client-fetch",
		{ name: "@hey-api/typescript", enums: "javascript" },
		"@hey-api/sdk"
	]
});
