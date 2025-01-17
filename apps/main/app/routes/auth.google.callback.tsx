import { data, redirect } from "react-router";

import type { Route } from "./+types/auth.google.callback.js";

import {
  AuthorizationError,
  authenticator,
} from "~/lib/authentication/authentication.server.js";
import { sessionStorage } from "~/session.server.js";

export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    const user = await authenticator.authenticate("google", request);

    const session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );
    session.set("user", user);

    throw redirect("/home", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return data(
        { passwordFailure: "Invalid email or password." },
        { status: 401 }
      );
    }
    throw error;
  }
};
