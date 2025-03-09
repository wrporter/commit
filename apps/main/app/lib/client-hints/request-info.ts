import { useRouteLoaderData } from "react-router";

import type { loader } from "~/root.js";

/**
 * @returns the request info from the root loader
 */
export function useRequestInfo() {
  const data = useRouteLoaderData<typeof loader>("root");
  if (!data?.requestInfo) {
    throw new Error("No requestInfo found in root loader");
  }

  return data.requestInfo;
}
