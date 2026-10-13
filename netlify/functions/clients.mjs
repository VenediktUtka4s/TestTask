import { runSync } from "../../lib/sync.js";

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
};

export default async () => {
  try {
    return new Response(JSON.stringify(await runSync()), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 502, headers });
  }
};
