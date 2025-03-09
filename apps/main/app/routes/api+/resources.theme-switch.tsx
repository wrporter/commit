import { parseWithZod } from "@conform-to/zod";
import { data, redirect } from "react-router";

import type { Route } from "./+types/resources.theme-switch.js";

import { ThemeFormSchema, setTheme } from "~/lib/theme/theme.js";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: ThemeFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { theme, redirectTo } = submission.value;

  const responseInit = {
    headers: { "set-cookie": setTheme(theme) },
  };

  if (redirectTo) {
    return redirect(redirectTo, responseInit);
  }
  return data(submission.reply(), responseInit);
}
