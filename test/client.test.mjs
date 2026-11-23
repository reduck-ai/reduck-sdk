import assert from "node:assert/strict";
import { test } from "node:test";
import { createReduckClient, credentialHeaders, DEFAULT_BASE_URL, getMe } from "../dist/index.js";

test("an API key travels as X-API-Key, an OAuth token as a bearer", () => {
	assert.deepEqual(credentialHeaders({ apiKey: " k " }), { "X-API-Key": "k" });
	assert.deepEqual(credentialHeaders({ oauthToken: "t" }), { Authorization: "Bearer t" });
	assert.deepEqual(credentialHeaders({}), {});
});

test("a request goes to the base URL with the credential", async () => {
	const seen = [];
	const fetch = async (req) => {
		seen.push(req);
		return new Response(JSON.stringify({ handle: "@me" }), {
			headers: { "content-type": "application/json" }
		});
	};
	const client = createReduckClient({ apiKey: "k", baseUrl: "https://example.test/" });
	const { data } = await getMe({ client, fetch });
	assert.equal(data.handle, "@me");
	assert.equal(seen[0].url, "https://example.test/api/me");
	assert.equal(seen[0].headers.get("x-api-key"), "k");
});

test("the default base URL is reduck.ai", () => {
	assert.equal(DEFAULT_BASE_URL, "https://reduck.ai");
	assert.equal(createReduckClient().getConfig().baseUrl, "https://reduck.ai");
});
