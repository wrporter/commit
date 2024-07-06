import  { type ActionFunction, type LoaderFunction , redirect } from '@remix-run/node';

import { authenticator } from '#app/auth.server';

export const loader: LoaderFunction = () => redirect('/login');

export const action: ActionFunction = ({ request }) => {
    return authenticator.authenticate('google', request);
};
