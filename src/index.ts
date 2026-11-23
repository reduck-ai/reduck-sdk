// Generated functions (getScript, patchScript, listRuns, getMe, …), their types and the fetch
// client, all derived from openapi.json.
export * from "./generated/index.js";
export {
	createReduckClient,
	credentialHeaders,
	DEFAULT_BASE_URL,
	type ReduckCredentials
} from "./client.js";

// The /api/me response, under a short name.
export type { GetMeResponse as Me } from "./generated/index.js";
