import { Button, Link } from "@nextui-org/react";
import { ValidatedForm, validationError } from "@rvf/react-router";
import { withZod } from "@rvf/zod";
import * as React from "react";
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  type MetaFunction,
  Link as RemixLink,
  data,
  redirect,
  useSearchParams,
} from "react-router";
import { z } from "zod";

import {
  authenticator,
  getUser,
} from "~/lib/authentication/authentication.server.js";
import { createUser, getUserByEmail } from "~/lib/repository/user.server.js";
import { FormInput } from "~/lib/ui/form-input.js";
import { sessionStorage } from "~/session.server.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (user) {
    throw redirect("/home");
  }
  return null;
};

const validator = withZod(
  z.object({
    displayName: z.string().min(1, { message: "Please enter a display name." }),
    email: z
      .string()
      .min(1, { message: "Please enter an email address." })
      .email("Please enter a valid email address."),
    password: z.string().min(1, { message: "Please enter a password." }),
    redirectTo: z.string(),
  })
);

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.clone().formData();
  const form = await validator.validate(formData);
  if (form.error) {
    return validationError(form.error);
  }

  const { displayName, email, password, redirectTo } = form.data;

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return data(
      {
        errors: {
          email:
            "This email is already taken. Please try a different email or try logging in.",
        },
      },
      { status: 400 }
    );
  }

  await createUser({ displayName, email, password });

  const user = await authenticator.authenticate("basic", request);

  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  session.set("user", user);

  throw redirect(redirectTo, {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
};

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export default function Signup() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  return (
    <>
      <h2 className="mb-6 text-center text-4xl">Sign up</h2>

      <Form
        action="/auth/google"
        method="post"
        className="mx-auto mb-8 w-full max-w-md"
      >
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="action" value="signup" />

        <Button
          type="submit"
          color="primary"
          variant="ghost"
          className="flex w-full items-center justify-center space-x-4"
        >
          <img src="/assets/google-logo.svg" alt="" className="h-6 w-6" />
          <span>Sign up with Google</span>
        </Button>
      </Form>

      <div className="mx-auto w-full max-w-md rounded bg-background px-8 py-8 drop-shadow-lg">
        <ValidatedForm
          validator={validator}
          method="post"
          className="flex flex-col gap-4"
          noValidate
        >
          <FormInput
            label="Display name"
            name="displayName"
            type="displayName"
          />

          <FormInput label="Email" id="email" name="email" type="email" />

          <FormInput
            label="Password"
            name="password"
            type="password"
          />

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button type="submit" color="primary" className="w-full">
            Create Account
          </Button>

          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                as={RemixLink}
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
                size="sm"
              >
                Log in
              </Link>
            </div>
          </div>
        </ValidatedForm>
      </div>
    </>
  );
}
