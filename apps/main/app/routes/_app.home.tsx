import type { LoaderFunction } from '@remix-run/node';

import { requireUser } from '~/auth.server';

export const loader: LoaderFunction = async ({ request, context }) => {
    await requireUser(request);
    return null;
};

export default function Page() {
    return (
        <div className="p-4">
            <h1 className="text-xl mb-4">Home</h1>

            <div>
                🚧 This page is under construction. Stay tuned for statistics about your account!
            </div>
        </div>
    );
}
