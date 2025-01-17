import {
  type ActionFunction,
  type LoaderFunction,
  redirect,
} from "react-router";

import { action as logout } from "./logout.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { deleteUserByEmail } from "~/lib/repository/user.server.js";

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  await deleteUserByEmail(user.email);
  return logout({ request, params });
};

export const loader: LoaderFunction = () => {
  return redirect("/home");
};
