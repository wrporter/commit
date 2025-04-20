import { redirect } from "react-router";

import type { Route } from "./+types/auth.logout.js";

import { sessionStorage } from "~/session.server.js";

export async function action({ request }: Route.LoaderArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  return redirect("/login", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}

export function loader() {
  return redirect("/");
}
