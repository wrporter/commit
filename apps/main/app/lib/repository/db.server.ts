import { remember } from "@epic-web/remember";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "#server/db-schema.server.js";
import { env } from "#server/env.server.js";

export const client = remember("db-client", () => postgres(env.DATABASE_URL));

export const db = remember("db", () =>
  drizzle(client, { schema, casing: "snake_case" })
);
