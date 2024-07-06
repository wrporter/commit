import { defineConfig } from 'drizzle-kit'
import { env } from './server/env.server.ts'

export default defineConfig({
    dialect: 'postgresql',
    schema: 'server/db-schema.server.ts',
    out: './migrations',
    dbCredentials: {
        url: env.DATABASE_URL,
    },
})
