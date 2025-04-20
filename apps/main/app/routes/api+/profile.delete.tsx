import { redirect } from "react-router";

import type { Route } from "./+types/profile.delete.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { deleteUserByEmail } from "~/lib/repository/user.server.js";
import { action as logout } from "~/routes/api+/auth.logout.js";

export async function action({ request, params, context }: Route.ActionArgs) {
  const user = await requireUser(request);
  await deleteUserByEmail(user.email);
  return logout({ request, params, context });
}

export function loader() {
  return redirect("/home");
}
