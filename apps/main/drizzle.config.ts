import { defineConfig } from "drizzle-kit";

// eslint-disable-next-line require-extensions/require-extensions
import { env } from './server/env.server';

export default defineConfig({
  dialect: "postgresql",
  schema: "server/schema/db-schema.server.ts",
  out: "./migrations",
  casing: 'snake_case',
  verbose: true,

  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
