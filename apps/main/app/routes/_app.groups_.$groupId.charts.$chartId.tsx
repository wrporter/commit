import { ClipboardIcon, RectangleGroupIcon, StarIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import React from 'react';

import { requireUser } from '~/auth.server';
import { getChartForUser } from '~/lib/models/chart.server';
import { getGroupForUser } from '~/lib/models/group.server';
import { MenuLink } from '~/lib/ui/header';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    const groupId = Number.parseInt(params.groupId ?? '0', 10);
    const chartId = Number.parseInt(params.chartId ?? '0', 10);

    const group = await getGroupForUser(user.id, groupId);
    const chart = await getChartForUser(user.id, chartId);

    return json({ group, chart });
};

export default function Page() {
    const { chart } = useLoaderData<typeof loader>();

    if (!chart) {
        return <div className="py-4">Chart not found!</div>;
    }

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl">{chart.name}</h2>
            </div>

            <div className="flex space-x-2">
                <MenuLink label="Tasks" to="tasks" icon={ClipboardIcon} />
                <MenuLink label="Rewards" to="rewards" icon={StarIcon} />
                <MenuLink label="Assignments" to="assignments" icon={RectangleGroupIcon} />
            </div>

            <Outlet />
        </section>
    );
}
