import  { type LoaderFunction } from '@remix-run/node';

import { requireUser } from '#app/auth.server';
import { useUser } from '#app/utils';

export const loader: LoaderFunction = async ({ request }) => {
    await requireUser(request);
    return null;
};
export default function Page() {
    const user = useUser();

    return <div>Hello, {user.displayName}!</div>;
}
