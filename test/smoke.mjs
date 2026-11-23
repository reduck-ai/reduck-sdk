// Calls the live API with a real key: node test/smoke.mjs   (REDUCK_API_KEY, optional REDUCK_BASE_URL)
import { createReduckClient, getMe, listScripts } from "../dist/index.js";

const apiKey = process.env.REDUCK_API_KEY;
if (!apiKey) throw new Error("Set REDUCK_API_KEY");
const client = createReduckClient({ apiKey, baseUrl: process.env.REDUCK_BASE_URL });

const me = await getMe({ client });
if (me.error) throw new Error(`getMe: ${JSON.stringify(me.error)}`);
console.log("me:", me.data.handle);

const scripts = await listScripts({ client, path: { handle: me.data.handle }, query: { page_size: 5 } });
if (scripts.error) throw new Error(`listScripts: ${JSON.stringify(scripts.error)}`);
console.log(`scripts: ${scripts.data.data.map((s) => s.slug).join(", ") || "(none)"}`);
