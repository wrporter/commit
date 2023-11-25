import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { authenticator, requireUser } from '~/auth.server';
import { deleteUserByEmail } from '~/lib/models/user.server';

export const action: ActionFunction = async ({ request }) => {
    const user = await requireUser(request);
    await deleteUserByEmail(user.email);
    return authenticator.logout(request, {
        redirectTo: '/',
    });
};

export const loader: LoaderFunction = async () => {
    return redirect('/home');
};
