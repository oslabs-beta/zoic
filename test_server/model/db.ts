import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts";

const config = Deno.env.get("SWARS_API_KEY");

const client = new Client("postgres://jwzjcurw:qKN9rE7SRHSYnAXAgeDjUOlocAScPv74@drona.db.elephantsql.com/jwzjcurw");
await client.connect();


export default client;