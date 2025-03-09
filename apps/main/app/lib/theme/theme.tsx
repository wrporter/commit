import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { Select, SelectItem } from "@heroui/react";
import * as cookie from "cookie";
import { useState } from "react";
import { useFetcher, useFetchers } from "react-router";
import { ServerOnly } from "remix-utils/server-only";
import { z } from "zod";

import { useHints } from "~/lib/client-hints/client-hints.js";
import { useRequestInfo } from "~/lib/client-hints/request-info.js";
import type { action as themeSwitchAction } from "~/routes/api+/resources.theme-switch.js";

export enum Theme {
  System = "system",
  Light = "light",
  Dark = "dark",
}

export const ThemeFormSchema = z.object({
  theme: z.nativeEnum(Theme),
  redirectTo: z.string().optional(),
});

const cookieName = "en_theme";
// export type Theme = "light" | "dark";

export function setTheme(theme: Theme) {
  if (theme === Theme.System) {
    return cookie.serialize(cookieName, "", { path: "/", maxAge: -1 });
  } else {
    return cookie.serialize(cookieName, theme, { path: "/", maxAge: 31536000 });
  }
}

export function getTheme(request: Request): Theme | null {
  const cookieHeader = request.headers.get("cookie");
  const parsed = cookieHeader
    ? cookie.parse(cookieHeader)[cookieName]
    : Theme.Light;
  if (parsed === Theme.Light || parsed === Theme.Dark) {
    return parsed;
  }
  return null;
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {
  const hints = useHints();
  const requestInfo = useRequestInfo();
  const optimisticMode = useOptimisticThemeMode();

  if (optimisticMode) {
    return optimisticMode === Theme.System ? hints.theme : optimisticMode;
  }

  return requestInfo.userPrefs.theme ?? hints.theme;
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
  const fetchers = useFetchers();
  const themeFetcher = fetchers.find(({ key }) => key === "ThemeSwitch");

  if (themeFetcher?.formData) {
    const submission = parseWithZod(themeFetcher.formData, {
      schema: ThemeFormSchema,
    });

    if (submission.status === "success") {
      return submission.value.theme;
    }
  }
}

const themes = [
  {
    key: Theme.System,
    icon: <ComputerDesktopIcon className="size-4" />,
    label: "System",
  },
  {
    key: Theme.Light,
    icon: <SunIcon className="size-4" />,
    label: "Light",
  },
  {
    key: Theme.Dark,
    icon: <MoonIcon className="size-4" />,
    label: "Dark",
  },
];

export function ThemeSwitch() {
  const fetcher = useFetcher<typeof themeSwitchAction>({ key: "ThemeSwitch" });

  const [form] = useForm({
    id: "theme-switch",
    lastResult: fetcher.data,
  });

  const requestInfo = useRequestInfo();

  const optimisticMode = useOptimisticThemeMode();
  const mode = optimisticMode ?? requestInfo.userPrefs.theme ?? Theme.System;

  const [selectedMode, setSelectedMode] = useState(mode);

  return (
    <fetcher.Form
      method="POST"
      {...getFormProps(form)}
      action="/api/resources/theme-switch"
      className="flex flex-col gap-4"
    >
      <ServerOnly>
        {() => (
          <input type="hidden" name="redirectTo" value={requestInfo.path} />
        )}
      </ServerOnly>
      <Select
        name="theme"
        aria-label="Theme"
        size="sm"
        variant="faded"
        defaultSelectedKeys={[mode]}
        startContent={themes.find(({ key }) => key === selectedMode)?.icon}
        onSelectionChange={(keys) => {
          const formData = new FormData();
          formData.set("theme", keys.currentKey ?? Theme.System);
          void fetcher.submit(formData, {
            method: "POST",
            action: "/api/resources/theme-switch",
          });
          setSelectedMode((keys.currentKey as Theme) ?? Theme.System);
        }}
      >
        {themes.map(({ key, icon, label }) => (
          <SelectItem key={key} startContent={icon}>
            {label}
          </SelectItem>
        ))}
      </Select>
    </fetcher.Form>
  );
}
