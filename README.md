<p align="center">
  <img src="https://cdn.reduck.ai/logo-full-dark.png" alt="Reduck" width="300" />
</p>

# @reduck-ai/sdk

[![npm](https://img.shields.io/npm/v/@reduck-ai/sdk.svg?style=flat-square)](https://www.npmjs.com/package/@reduck-ai/sdk)

TypeScript SDK for [Reduck](https://reduck.ai). Use it to manage your browser
scripts, devices and runs from your code. Each function and type is generated
from the [OpenAPI specification](./openapi.json) that reduck.ai publishes at
`https://reduck.ai/api/openapi.json`.

## Installation

```bash
npm install @reduck-ai/sdk
```

## Quick Start

```typescript
import { createReduckClient, createScript, listScripts } from "@reduck-ai/sdk";

const client = createReduckClient({ apiKey: process.env.REDUCK_API_KEY! });

// Every function takes { client, path?, query?, body? } and returns { data, error }.
const { data: scripts } = await listScripts({
	client,
	path: { handle: "@username" },
	query: { q: "linkedin" }
});

const { data: script, error } = await createScript({
	client,
	path: { handle: "@username" },
	body: {
		slug: "linkedin-jobs",
		host: "linkedin.com",
		description: "Pull job posts",
		content: "await page.goto('https://linkedin.com/jobs')",
		input_schema: {},
		output_schema: {},
		side_effects: "none"
	}
});
if (error) throw new Error(error.error);
```

Inputs and responses are fully typed and autocomplete in your editor.

## Authentication

`createReduckClient` takes one credential: `apiKey` or `oauthToken`.

```typescript
const client = createReduckClient({ apiKey: "<your-api-key>" }); // server-side
const client = createReduckClient({ oauthToken: "<your-oauth-token>" }); // user-facing apps
```

Create an API key at [reduck.ai/api-keys](https://reduck.ai/api-keys).

An `oauthToken` must be an access token **issued for this API**: request it with
`resource=https://reduck.ai` (RFC 8707), and make sure it carries the scopes the
endpoints you call need: `script:read` / `script:write`, `run:read`,
`device:read` / `device:write`, `app:read`, `profile`. The API refuses a token
issued for a different Reduck resource, such as the MCP server: an access token
is only valid at the resource it names.

## Options

| Option    | Default             | Description                                       |
| --------- | ------------------- | ------------------------------------------------- |
| `baseUrl` | `https://reduck.ai` | The origin of the API. The paths include `/api`.  |
| `headers` | none                | More headers to send with each request.           |

## API

Pass the returned `client` to any function. List endpoints return
`{ data, has_next_page }` and take `query: { page?, page_size?, … }`; the rest take
`path` and/or `body`.

| Function                    | Args (besides `client`)                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `getMe`                     | none                                                                      |
| `listDevices`               | none                                                                      |
| `listRuns`                  | `query: { page?, page_size? }`                                            |
| `getRun`                    | `path: { run_id }`                                                        |
| `listAllScripts`            | `query: { host?, q?, visibility?, archived? }`                            |
| `listScripts`               | `path: { handle }`, `query: { host?, slug?, visibility?, archived?, q? }` |
| `getScript`                 | `path: { handle, host, slug }`                                            |
| `createScript`              | `path: { handle }`, `body`                                                |
| `patchScript`               | `path: { handle, host, slug }`, `body: { name?, description? }`           |
| `publishScript`             | `path: { handle, host, slug }`                                            |
| `unpublishScript`           | `path: { handle, host, slug }`                                            |
| `archiveScript`             | `path: { handle, host, slug }`                                            |
| `restoreScript`             | `path: { handle, host, slug }`                                            |
| `listScriptVersions`        | `path: { handle, host, slug }`, `query`                                   |
| `createDraftScriptVersion`  | `path: { handle, host, slug }`, `body`                                    |
| `getScriptVersion`          | `path: { handle, host, slug, version_id }`                                |
| `listScriptTransferTargets` | `path: { handle, host, slug }`                                            |
| `transferScript`            | `path: { handle, host, slug }`, `body: { target }`                        |

`handle` is `@username` for a personal scope or a project slug. The table shows
the frequent functions. Your editor shows all of them, or see
[openapi.json](./openapi.json).

## Errors

Functions do not throw by default: they return `{ data, error }`. On a failed
request, `data` is undefined and `error` holds the error that the server sent:

- `status`: the HTTP status of the response.
- `code`: identifies the error. Use this value in your code. New values can be
  added: for a value that you do not know, use the status.
- `error`: describes the error for a person. The text can change: do not use
  it in your code.
- `variables`: for a request body that is not valid, the errors of each field.

After a check of `error.status`, the type of `error.code` has only the codes that
the function can answer with that status.

```typescript
const { data, error } = await getScript({
	client,
	path: { handle, host, slug }
});
if (error) {
	if (error.code === "not_found") return null;
	console.error(error.error); // or per-field error.variables
	return;
}
```

## Versions

The package follows [semantic versioning](https://semver.org). A change to the
API that can break your code gives a major version.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
