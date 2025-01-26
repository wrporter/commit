import { redirect } from "react-router";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";

import { env } from "#server/env.server.js";
import { log } from "#server/log.server.js";
import { GoogleStrategy } from "~/lib/authentication/authentication.google.js";
import {
  type User,
  createUser,
  getUserByEmail,
  verifyLogin,
} from "~/lib/repository/user.server.js";
import { sessionStorage } from "~/session.server.js";

export class AuthorizationError extends Error {}

export const AUTH_ERROR_KEY = "auth-error-key";

export const authenticator = new Authenticator<Omit<User, "passwordHash">>();

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const user = await verifyLogin(email, password);
    if (!user) {
      throw new AuthorizationError("Invalid email or password");
    }

    return user;
  }),
  "basic"
);

let port = "";
if (env.SITE_PORT) {
  port = `:${env.SITE_PORT}`;
}

authenticator.use(
  new GoogleStrategy<User>(
    {
      clientId: env.GOOGLE_OAUTH_CLIENT_ID || "",
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET || "",
      redirectURI: `${env.SITE_PROTOCOL}://${env.SITE_HOST}${port}/api/auth/google/callback`,
    },
    async (profile) => {
      let user = await getUserByEmail(profile.emails[0].value);
      if (!user) {
        user = await createUser({
          displayName: profile.displayName,
          email: profile.emails[0].value,
          imageUrl: profile.photos[0].value,
          image: undefined,
          socialProviders: { google: true },
        });
        log.info(JSON.stringify(user));
      }
      invariant(user, "User does not exist");
      return user;
    }
  ),
  "google"
);

export async function getUser(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  return session.get("user");
}

export async function requireUser(request: Request) {
  const redirectTo = new URL(request.url).pathname;
  const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);

  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user = session.get("user");
  if (!user) {
    throw redirect(`/login?${searchParams}`);
  }
  return user;
}
