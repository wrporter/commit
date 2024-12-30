import { Button, Checkbox, Input, Link } from "@nextui-org/react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useActionData,
  useSearchParams,
} from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import * as React from "react";
import { AuthorizationError } from "remix-auth";
import {
  ValidatedForm,
  useFormContext,
  validationError,
} from "remix-validated-form";
import { z } from "zod";

import { authenticator } from "#app/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return authenticator.isAuthenticated(request, {
    successRedirect: "/home",
  });
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

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const form = await validator.validate(formData);
  if (form.error) {
    return validationError(form.error);
  }
  const { redirectTo } = form.data;

  try {
    return await authenticator.authenticate("basic", request, {
      successRedirect: redirectTo,
      context: { formData },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof AuthorizationError) {
      return json(
        { passwordFailure: "Invalid email or password." },
        { status: 401 }
      );
    }
    throw error;
  }
};

export const meta: MetaFunction = () => [{ title: "Commit: Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/home";
  const form = useFormContext("loginForm");
  const actionData = useActionData<{ passwordFailure?: string }>();

  return (
    <>
      <h2 className="mb-6 text-center text-4xl">Log in</h2>

      <Form
        action="/auth/google"
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
          id="loginForm"
          validator={validator}
          method="post"
          className="flex flex-col gap-6"
          noValidate
        >
          <div>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              aria-describedby="email-error"
            />
            {form.fieldErrors.email && (
              <div className="pt-1 text-red-700" id="email-error">
                {form.fieldErrors.email}
              </div>
            )}
          </div>

          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-describedby="password-error"
            />
            {form.fieldErrors.password && (
              <div className="pt-1 text-red-700" id="password-error">
                {form.fieldErrors.password}
              </div>
            )}

            {actionData?.passwordFailure && (
              <div className="pt-1 text-red-700">
                {actionData.passwordFailure}
              </div>
            )}
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button type="submit" color="primary" className="w-full">
            Log in
          </Button>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
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
        </ValidatedForm>
      </div>
    </>
  );
}
