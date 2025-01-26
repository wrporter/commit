import { remember } from "@epic-web/remember";
import { log } from "@wesp-up/express";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "./env.server.js";
import * as schema from "./schema/db-schema.server.js";

class DrizzleLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    log.debug({ message: query, params });
  }
}

export const client = remember("db-client", () => postgres(env.DATABASE_URL));

export const db = remember("db", () =>
  drizzle({
    client,
    schema,
    casing: "snake_case",
    logger: env.NODE_ENV === "development" ? new DrizzleLogger() : undefined,
  })
);

export type DrizzleDatabaseClient = typeof db;
export type DrizzleTransaction = Parameters<
  Parameters<DrizzleDatabaseClient["transaction"]>[0]
>[0];
