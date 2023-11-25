import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, useSearchParams } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { Button, TextField, TextLink } from '@wesp-up/ui';
import * as React from 'react';
import { ValidatedForm, useFormContext, validationError } from 'remix-validated-form';
import { z } from 'zod';

import { authenticator } from '~/auth.server';
import { createUser, getUserByEmail } from '~/lib/models/user.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    return authenticator.isAuthenticated(request, {
        successRedirect: '/home',
    });
};

const validator = withZod(
    z.object({
        displayName: z.string().min(1, { message: 'Please enter a display name.' }),
        email: z
            .string()
            .min(1, { message: 'Please enter an email address.' })
            .email('Please enter a valid email address.'),
        password: z.string().min(1, { message: 'Please enter a password.' }),
        redirectTo: z.string(),
    }),
);

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const form = await validator.validate(formData);
    if (form.error) {
        return validationError(form.error);
    }

    const { displayName, email, password, redirectTo } = form.data;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return json(
            {
                errors: {
                    email: 'This email is already taken. Please try a different email or try logging in.',
                },
            },
            { status: 400 },
        );
    }

    await createUser({ displayName, email, password });

    return authenticator.authenticate('basic', request, {
        successRedirect: redirectTo,
        context: { formData },
    });
};

export const meta: MetaFunction = () => [{ title: 'Sign Up' }];

export default function Signup() {
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') ?? '/home';
    const form = useFormContext('signupForm');

    return (
        <>
            <h2 className="mb-6 text-center text-4xl">Sign up</h2>

            <Form action="/auth/google" method="post" className="mx-auto mb-8 w-full max-w-md">
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input type="hidden" name="action" value="signup" />

                <Button
                    type="submit"
                    kind="tertiary"
                    className="flex w-full items-center justify-center space-x-4"
                >
                    <img src="/assets/google-logo.svg" alt="" className="h-6 w-6" />
                    <span>Sign up with Google</span>
                </Button>
            </Form>

            <div className="mx-auto w-full max-w-md rounded bg-white px-8 py-8 drop-shadow">
                <ValidatedForm
                    id="signupForm"
                    validator={validator}
                    method="post"
                    className="space-y-6"
                    noValidate
                >
                    <div>
                        <label
                            htmlFor="displayName"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Display name
                        </label>
                        <div className="mt-1">
                            <TextField
                                id="displayName"
                                name="displayName"
                                type="displayName"
                                autoComplete="displayName"
                                aria-invalid={Boolean(form.fieldErrors.displayName)}
                                aria-describedby="displayName-error"
                                className="w-full"
                            />
                            {form.fieldErrors.displayName && (
                                <div className="pt-1 text-red-700" id="displayName-error">
                                    {form.fieldErrors.displayName}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <div className="mt-1">
                            <TextField
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                aria-invalid={Boolean(form.fieldErrors.email)}
                                aria-describedby="email-error"
                                className="w-full"
                            />
                            {form.fieldErrors.email && (
                                <div className="pt-1 text-red-700" id="email-error">
                                    {form.fieldErrors.email}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <div className="mt-1">
                            <TextField
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                aria-invalid={Boolean(form.fieldErrors.password)}
                                aria-describedby="password-error"
                                className="w-full"
                            />
                            {form.fieldErrors.password && (
                                <div className="pt-1 text-red-700" id="password-error">
                                    {form.fieldErrors.password}
                                </div>
                            )}
                        </div>
                    </div>

                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <Button type="submit" className="w-full">
                        Create Account
                    </Button>
                    <div className="flex items-center justify-center">
                        <div className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <TextLink
                                as={Link}
                                to={{
                                    pathname: '/login',
                                    search: searchParams.toString(),
                                }}
                            >
                                Log in
                            </TextLink>
                        </div>
                    </div>
                </ValidatedForm>
            </div>
        </>
    );
}
