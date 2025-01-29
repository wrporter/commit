import { Button, Checkbox, Input, Link } from "@heroui/react";
import { ValidatedForm, validationError } from "@rvf/react-router";
import { withZod } from "@rvf/zod";
import * as React from "react";
import {
  Form,
  type MetaFunction,
  Link as RemixLink,
  data,
  redirect,
  useSearchParams,
} from "react-router";
import { z } from "zod";

import type { Route } from "./+types/login.js";

import {
  AuthorizationError,
  authenticator,
} from "~/lib/authentication/authentication.server.js";
import { FormInput } from "~/lib/ui/form-input.js";
import { sessionStorage } from "~/session.server.js";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user = session.get("user");
  if (user) {
    throw redirect("/home");
  }
  return null;
};

const validator = withZod(
  z.object({
    email: z
      .string()
      .min(1, { message: "Please enter an email address." })
      .email("Please enter a valid email address."),
    password: z.string().min(1, { message: "Please enter a password." }),
    redirectTo: z.string(),
  })
);

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.clone().formData();
  const form = await validator.validate(formData);
  if (form.error) {
    return validationError(form.error);
  }
  const { redirectTo } = form.data;

  try {
    const user = await authenticator.authenticate("basic", request);

    const session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );
    session.set("user", user);

    throw redirect(redirectTo, {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return data(
        { passwordFailure: "Invalid email or password." },
        { status: 401 }
      );
    }
    throw error;
  }
};

export const meta: MetaFunction = () => [{ title: "Commit: Login" }];

export default function Component({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/home";

  return (
    <>
      <h2 className="mb-6 text-center text-4xl">Log in</h2>

      <Form
        action="/api/auth/google"
        method="post"
        className="mx-auto mb-8 w-full max-w-md"
      >
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="action" value="login" />

        <Button
          type="submit"
          color="primary"
          variant="ghost"
          className="flex w-full items-center justify-center space-x-4"
        >
          <img src="/assets/google-logo.svg" alt="" className="h-6 w-6" />
          <span>Log in with Google</span>
        </Button>
      </Form>

      <div className="mx-auto w-full max-w-md rounded bg-background px-8 py-8 drop-shadow-lg">
        <ValidatedForm
          validator={validator}
          method="post"
          className="flex flex-col gap-4"
          noValidate
        >
          {(form) => (
            <>
              <FormInput
                label="Email"
                name="email"
                type="email"
                data-1p-ignore={false}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                isInvalid={Boolean(
                  form.formState.fieldErrors.password ||
                    // @ts-ignore - The type is not getting inferred properly.
                    actionData?.passwordFailure
                )}
                errorMessage={
                  form.formState.fieldErrors.password ||
                  // @ts-ignore - The type is not getting inferred properly.
                  actionData?.passwordFailure
                }
              />

              <input type="hidden" name="redirectTo" value={redirectTo} />
              <Button type="submit" color="primary" className="w-full">
                Log in
              </Button>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div className="flex items-center">
                  <Checkbox id="remember" name="remember" size="sm">
                    Remember me
                  </Checkbox>
                </div>
                <div className="text-center text-sm text-gray-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    as={RemixLink}
                    to={{
                      pathname: "/signup",
                      search: searchParams.toString(),
                    }}
                    size="sm"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </>
          )}
        </ValidatedForm>
      </div>
    </>
  );
}
