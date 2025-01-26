/**
 * This file contains utilities for using client hints for user preference which
 * are needed by the server, but are only known by the browser.
 */
import { getHintUtils } from "@epic-web/client-hints";
import { subscribeToSchemeChange } from "@epic-web/client-hints/color-scheme";
import { clientHint as timeZoneHint } from "@epic-web/client-hints/time-zone";
import React from "react";
import { useRevalidator } from "react-router";

import { useRootLoaderData } from "./use-root-loader-data.js";

const hintsUtils = getHintUtils({
  timeZone: timeZoneHint,
  locale: {
    cookieName: "CH-locale",
    getValueCode: "navigator.language",
    fallback: "en-US",
  },
});

export const { getHints } = hintsUtils;

/**
 * @returns an object with the client hints and their values
 */
export function useHints() {
  const data = useRootLoaderData();
  if (!data?.hints) {
    throw new Error("No hints found in root loader");
  }
  return data.hints;
}

/**
 * @returns inline script element that checks for client hints and sets cookies
 * if they are not set then reloads the page if any cookie was set to an
 * inaccurate value.
 */
export function ClientHintCheck() {
  const { revalidate } = useRevalidator();
  React.useEffect(
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    () => subscribeToSchemeChange(() => revalidate()),
    [revalidate]
  );

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: hintsUtils.getClientHintCheckScript(),
      }}
    />
  );
}
