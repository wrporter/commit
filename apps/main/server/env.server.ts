import { cleanEnv, str, url } from 'envalid';

export const env = cleanEnv(process.env, {
    DATABASE_URL: url(),
    GOOGLE_OAUTH_CLIENT_ID: str(),
    GOOGLE_OAUTH_CLIENT_SECRET: str(),
    NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
    SESSION_SECRET: str(),
    SITE_HOST: str(),
    SITE_PORT: str(),
    SITE_PROTOCOL: str(),
});
