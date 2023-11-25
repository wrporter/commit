import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { authenticator } from '~/auth.server';

export const action: ActionFunction = async ({ request }) => {
    return authenticator.logout(request, { redirectTo: '/' });
};

export const loader: LoaderFunction = async () => {
    return redirect('/');
};
