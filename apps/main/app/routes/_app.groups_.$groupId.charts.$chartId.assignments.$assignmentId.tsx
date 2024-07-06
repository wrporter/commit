import  { type LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { requireUser } from '#app/auth.server';
import { getChartForUser } from '#app/lib/models/chart.server';
import { getGroupForUser } from '#app/lib/models/group.server';
import { deleteTaskAssignment } from '#app/lib/models/task.server';
import { loader as chartLoader } from '#app/routes/_app.groups_.$groupId.charts.$chartId';

export const loader = chartLoader;

export const action = async ({ request, params }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    const groupId = Number.parseInt(params.groupId ?? '0', 10);
    invariant(groupId, 'Group not found');
    const group = await getGroupForUser(user.id, groupId);
    invariant(group, 'Unauthorized');

    const chartId = Number.parseInt(params.chartId ?? '0', 10);
    invariant(chartId, 'Chart not found');
    const chart = await getChartForUser(user.id, chartId);
    invariant(chart, 'Unauthorized');

    const assignmentId = Number.parseInt(params.assignmentId ?? '0', 10);
    invariant(assignmentId, 'Assignment not found');

    if (request.method === 'DELETE') {
        return deleteTaskAssignment(user.id, assignmentId);
    }

    return null;
};
