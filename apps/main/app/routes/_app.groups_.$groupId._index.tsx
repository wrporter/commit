import { useLoaderData } from '@remix-run/react';
import React from 'react';

import { loader as groupLoader } from '#app/routes/_app.groups_.$groupId';

export const loader = groupLoader;

export default function Page() {
    const { group } = useLoaderData<typeof loader>();

    return (
        <div>
            <h2>Group: {group?.name}</h2>

            <p>🚧 This page is under construction. Stay tuned for statistics about groups!</p>
        </div>
    );
}
