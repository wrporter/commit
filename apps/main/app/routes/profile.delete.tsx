import {
  type ActionFunction,
  type LoaderFunction,
  redirect,
} from "@remix-run/node";

import { authenticator, requireUser } from "#app/auth.server";
import { deleteUserByEmail } from "#app/lib/repository/user.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  await deleteUserByEmail(user.email);
  return authenticator.logout(request, {
    redirectTo: "/",
  });
};

export const loader: LoaderFunction = async () => {
  return redirect("/home");
};
