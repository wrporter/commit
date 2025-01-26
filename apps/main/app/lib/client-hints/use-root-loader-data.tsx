import { useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "~/root.js";

/**
 * @returns the data from the root loader.
 */
export function useRootLoaderData() {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  if (!data) {
    throw new Error("No data found in root loader");
  }
  return data;
}
