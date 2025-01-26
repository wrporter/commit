import {
  type ActionFunction,
  type LoaderFunction,
  redirect,
} from "react-router";

import { authenticator } from "~/lib/authentication/authentication.server.js";

export const loader: LoaderFunction = () => redirect("/login");

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("google", request);
};
