import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/singlestore";
import { beforeAll, afterAll } from "vitest";

let client: PGlite

beforeAll(async () => {
    client = new PGlite();
    const db = drizzle(client)
});

afterAll(async () => {
    await client.close();
})