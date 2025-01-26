import {
  type ActionFunction,
  type LoaderFunction,
  redirect,
} from "react-router";

import { sessionStorage } from "~/session.server.js";

export const action: ActionFunction = async ({ request }) => {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  return redirect("/login", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
};

export const loader: LoaderFunction = () => {
  return redirect("/");
};
