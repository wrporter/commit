import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("test"),
      z.literal("production"),
    ])
    .default("development"),
  DATABASE_URL: z.string().trim().url(),

  GOOGLE_OAUTH_CLIENT_ID: z.string().trim(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().trim(),
  SESSION_SECRET: z.string().trim(),
  SITE_HOST: z.string().trim(),
  SITE_PORT: z.string().trim(),
  SITE_PROTOCOL: z.string().trim(),
});

export type Environment = z.infer<typeof envSchema>;
export const env: Environment = envSchema.parse(process.env);
