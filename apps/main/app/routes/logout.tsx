import {
  type ActionFunction,
  type LoaderFunction,
  redirect,
} from "@remix-run/node";

import { authenticator } from "#app/auth.server";

export const action: ActionFunction = async ({ request }) => {
  return authenticator.logout(request, { redirectTo: "/" });
};

export const loader: LoaderFunction = async () => {
  return redirect("/");
};
