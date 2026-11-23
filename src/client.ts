import { createClient, createConfig } from "./generated/client/index.js";

export const DEFAULT_BASE_URL = "https://reduck.ai";

// `oauthToken` must be an access token audienced at this API (RFC 8707 `resource`); a token
// issued for another Reduck resource, such as the MCP server, is refused.
export type ReduckCredentials = { oauthToken: string } | { apiKey: string };

// The single place a credential becomes headers, so a caller reaching an endpoint the generated
// client does not cover still authenticates identically.
export function credentialHeaders(cred: ReduckCredentials | {}): Record<string, string> {
	if ("oauthToken" in cred) return { Authorization: `Bearer ${cred.oauthToken.trim()}` };
	if ("apiKey" in cred) return { "X-API-Key": cred.apiKey.trim() };
	return {};
}

// Returns a client preconfigured with the API base URL and the auth header. Pass it to any
// generated function: getScript({ client, path: { handle, host, slug } }).
// Omit credentials for unauthenticated access to public routes.
export function createReduckClient(
	opts: (ReduckCredentials | {}) & {
		baseUrl?: string;
		headers?: Record<string, string>;
	} = {}
) {
	return createClient(
		createConfig({
			baseUrl: (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, ""),
			headers: { ...credentialHeaders(opts), ...opts.headers }
		})
	);
}
