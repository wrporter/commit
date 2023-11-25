import { ChartBarIcon, UserCircleIcon, UsersIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { TextLink } from '@wesp-up/ui';
import React from 'react';

import { requireUser } from '~/auth.server';
import { getGroupForUser } from '~/lib/models/group.server';
import { MenuLink } from '~/lib/ui/header';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const user = await requireUser(request);
    const groupId = Number.parseInt(params.groupId ?? '0', 10);
    const group = await getGroupForUser(user.id, groupId);
    return json({ group });
};

export default function Page() {
    const { group } = useLoaderData<typeof loader>();

    if (!group) {
        return <div className="py-4">Group not found!</div>;
    }

    return (
        <div className="flex h-full">
            <aside
                className="w-64 pt-2 flex-col transition-transform bg-white border-r border-gray-200 hidden sm:flex"
                aria-label="Sidebar"
            >
                <div className="h-full px-3 pt-2 pb-4 overflow-y-auto bg-white">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <MenuLink label="Owners" to="owners" icon={UserCircleIcon} />
                        </li>
                        <li>
                            <MenuLink label="People" to="people" icon={UsersIcon} />
                        </li>
                        <li>
                            <MenuLink label="Charts" to="charts" icon={ChartBarIcon} />
                        </li>
                    </ul>
                </div>
            </aside>

            <div className="flex-grow p-4">
                <h1 className="text-sm mb-2">
                    <TextLink className="no-underline" as={Link} to="/groups">
                        Groups
                    </TextLink>{' '}
                    /{' '}
                    <TextLink className="no-underline" as={Link} to={`/groups/${group.id}`}>
                        {group.name}
                    </TextLink>
                </h1>

                <div className="flex gap-2 sm:hidden text-sm mb-4">
                    <TextLink as={Link} to={`/groups/${group.id}/owners`}>
                        Owners
                    </TextLink>
                    <TextLink as={Link} to={`/groups/${group.id}/people`}>
                        People
                    </TextLink>
                    <TextLink as={Link} to={`/groups/${group.id}/charts`}>
                        Charts
                    </TextLink>
                </div>

                <Outlet />
            </div>
        </div>
    );
}
