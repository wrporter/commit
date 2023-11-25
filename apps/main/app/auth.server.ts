import type { User } from '@prisma/client';
import { log } from '@wesp-up/express-remix';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { GoogleStrategy } from 'remix-auth-google';
import invariant from 'tiny-invariant';

import { sessionStorage } from './session.server';

import { createUser, getUserByEmail, verifyLogin } from '~/lib/models/user.server';
import { env } from '~/server/env.server';

export const AUTH_ERROR_KEY = 'auth-error-key';

export const authenticator = new Authenticator<User>(sessionStorage, {
    sessionErrorKey: AUTH_ERROR_KEY,
    throwOnError: true,
});

authenticator.use(
    new FormStrategy(async ({ form }) => {
        const email = form.get('email') as string;
        const password = form.get('password') as string;

        const user = await verifyLogin(email, password);
        invariant(user, 'Invalid email or password');

        return user;
    }),
    'basic',
);

let port = '';
if (env.SITE_PORT) {
    port = `:${env.SITE_PORT}`;
}

authenticator.use(
    new GoogleStrategy(
        {
            clientID: env.GOOGLE_OAUTH_CLIENT_ID || '',
            clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET || '',
            callbackURL: `${env.SITE_PROTOCOL}://${env.SITE_HOST}${port}/auth/google/callback`,
        },
        async ({ profile }) => {
            log.info(JSON.stringify(env));
            let user = await getUserByEmail(profile.emails[0].value);
            if (!user) {
                user = await createUser({
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    imageUrl: profile.photos[0].value,
                    image: undefined,
                    socialProviders: { google: true },
                });
                log.info(JSON.stringify(user));
            }
            invariant(user, 'User does not exist');
            return user;
        },
    ),
    'google',
);

export async function getUser(request: Request) {
    return authenticator.isAuthenticated(request);
}

export async function requireUser(request: Request) {
    const redirectTo = new URL(request.url).pathname;
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    return authenticator.isAuthenticated(request, {
        failureRedirect: `/login?${searchParams}`,
    });
}
