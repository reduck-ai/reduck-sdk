<p align="center">
  <img src="https://cdn.reduck.ai/logo-full-dark.png" alt="Reduck" width="300" />
</p>

# @reduck-ai/sdk

[![npm](https://img.shields.io/npm/v/@reduck-ai/sdk.svg?style=flat-square)](https://www.npmjs.com/package/@reduck-ai/sdk)

[Reduck](https://reduck.ai) automates websites that have no API, such as LinkedIn,
Gmail, Google Maps or your own back office. Each automation is a **script**: a saved
browser automation for one site, with typed inputs and output. Run a script and get
its output as JSON, on a cloud browser that Reduck hosts or on your own browser.

With this TypeScript SDK, your code can:

- **Run scripts**: the official scripts that Reduck maintains, or your own scripts.
- **Read runs**: the output, the error and the trace of each run.
- **Manage scripts and devices**: create a script, change it, publish it, and list
  the browsers that you paired.

Each function and type is generated from the
[OpenAPI specification](https://reduck.ai/api/openapi.json) of reduck.ai.

## Quick start

### 1. Install

```bash
npm install @reduck-ai/sdk
```

### 2. Get an API key

[Sign up](https://reduck.ai/#signin), then create an API key at
[reduck.ai/api-keys](https://reduck.ai/api-keys).

```bash
export REDUCK_API_KEY="<your-api-key>"
```

### 3. Run your first script

This code runs `reduck/search.brave.com/search`, an official script, on a cloud
browser:

```typescript
import { createReduckClient, getRun, runScript } from "@reduck-ai/sdk";

const client = createReduckClient({ apiKey: process.env.REDUCK_API_KEY! });

const { data: run, error } = await runScript({
	client,
	path: { handle: "reduck", host: "search.brave.com", slug: "search" },
	body: { browser: "managed", args: { query: "browser automation" } }
});
if (error) throw new Error(error.error);

// The request waits up to 25 seconds (`wait_seconds`) for the run to end.
// A longer run continues: read it again with getRun until it has a `finished_at`.
let current = run;
while (!current.finished_at) {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const next = await getRun({ client, path: { run_id: current.id } });
	if (next.error) throw new Error(next.error.error);
	current = next.data;
}

console.log(current.status, current.result);
```

Every function takes `{ client, path?, query?, body? }` and returns
`{ data, error }`. Inputs and responses are fully typed and autocomplete in your
editor.

On success, `status` is `"success"` and `result` is `{ result: <the output> }`. On
failure, `status` is `"error"` and `result` is `{ error: <message> }`;
`error_type` tells what caused the failure, and `external_message` tells what you
can do about it.

`browser: "managed"` runs the script on a cloud browser. To run it on your own
browser, where you are signed in to your sites, use `browser: "extension"`. Install the
[Reduck extension](https://chromewebstore.google.com/detail/reduck/koccidjchcojlmgkdhibpgjbnhcoopio)
and pair it with your account first.

## Find a script

The **official scripts** cover the sites that people automate most, such as
Google, LinkedIn, Reddit, Gmail and Amazon. Reduck maintains them and repairs
them when a site changes. They are under the handle `reduck`:

```typescript
const { data: scripts } = await listScripts({
	client,
	path: { handle: "reduck" },
	query: { q: "linkedin" }
});
```

Each script has an input schema and an output schema. Read them with `getScript`
before you run it. You can also find the scripts at
[reduck.ai/explore](https://reduck.ai/explore).

When you develop, an AI agent can find scripts and try them for you. Connect your
agent to the [Reduck MCP server](https://docs.reduck.ai/connect-your-agent),
ask it to do your task, and it tells you which scripts it ran and with which
inputs. Then put the same calls in your code.

## Build your own scripts

When no official script does what you need, an AI agent can build a script for
you through the Reduck MCP server, and test it on the site. Your code then runs it
like any other script, with your handle. See
[Build your own scripts](https://docs.reduck.ai/#build-your-own-scripts).

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

| Option    | Default             | Description                                      |
| --------- | ------------------- | ------------------------------------------------ |
| `baseUrl` | `https://reduck.ai` | The origin of the API. The paths include `/api`. |
| `headers` | none                | More headers to send with each request.          |

## API

Pass the returned `client` to any function. List endpoints return
`{ data, has_next_page }` and take `query: { page?, page_size?, … }`; the rest take
`path` and/or `body`.

| Function                    | Args (besides `client`)                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `runScript`                 | `path: { handle, host, slug }`, `body: { args?, browser?, … }`            |
| `runScripts`                | `body: { scripts, … }`                                                    |
| `getRun`                    | `path: { run_id }`                                                        |
| `getRunTrace`               | `path: { run_id }`                                                        |
| `listRuns`                  | `query: { page?, page_size? }`                                            |
| `getMe`                     | none                                                                      |
| `listDevices`               | none                                                                      |
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

`handle` is `@username` for a personal scope, a project slug, or `reduck` for the
official scripts. The table shows the frequent functions. Your editor shows all of
them, or see [openapi.json](https://reduck.ai/api/openapi.json).

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

A run that fails is not an error of the request: the request succeeds, and the run
has `status: "error"`.

## Versions

The package follows [semantic versioning](https://semver.org). A change to the
API that can break your code gives a major version.

## License

MIT
