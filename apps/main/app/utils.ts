import { useRouteLoaderData } from "react-router";

import type { User } from "~/lib/repository/user.server.js";
import type { loader } from "~/root.js";

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useRouteLoaderData<typeof loader>("root");
  if (!data?.requestInfo?.user || !isUser(data.requestInfo.user)) {
    return undefined;
  }
  return data.requestInfo.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  maybeUser.createdAt = new Date(maybeUser.createdAt);
  maybeUser.updatedAt = new Date(maybeUser.updatedAt);
  return maybeUser;
}
