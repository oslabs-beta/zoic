import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts";
// import * as postgres from "https://deno.land/x/postgres@v0.14.0/mod.ts";

const config = Deno.env.get("SWARS_API_KEY");

const client = new Client(config);
await client.connect();

try {
  const result = await client.queryArray(`SELECT * FROM "public"."films" LIMIT 10`);
  console.log(result);
} catch {
  console.log('error during connection')
}

// await client.end();

export default client;