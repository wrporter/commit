import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import React from 'react';
import { validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { requireUser } from '~/auth.server';
import { getChartForUser } from '~/lib/models/chart.server';
import { getGroupForUser } from '~/lib/models/group.server';
import { createTask, deleteTask, updateTask } from '~/lib/models/task.server';
import type { ResourceFormField, ResourceFormPropagatedProps } from '~/lib/ui/resource-pill';
import { ResourceDialog, ResourcePill } from '~/lib/ui/resource-pill';
import { loader as chartLoader } from '~/routes/_app.groups_.$groupId.charts.$chartId';

export const loader = chartLoader;

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const user = await requireUser(request);

    const groupId = Number.parseInt(params.groupId ?? '0', 10);
    invariant(groupId, 'Group not found');
    const group = await getGroupForUser(user.id, groupId);
    invariant(group, 'Unauthorized');

    const chartId = Number.parseInt(params.chartId ?? '0', 10);
    invariant(chartId, 'Chart not found');
    const chart = await getChartForUser(user.id, chartId);
    invariant(chart, 'Unauthorized');

    if (request.method === 'DELETE') {
        const formData = await request.formData();
        const taskId = Number.parseInt((formData.get('taskId') as string) ?? '0', 10);
        invariant(taskId, 'No taskId found');
        return deleteTask(user.id, chartId, taskId);
    }

    const form = await validator.validate(await request.formData());
    if (form.error) {
        return validationError(form.error);
    }

    if (request.method === 'POST') {
        invariant(form.data.name, 'No name found');
        const task = createTask({ chartId, ...form.data });
        return json(task);
    }

    if (request.method === 'PUT') {
        invariant(form.data.taskId, 'No taskId found');
        return updateTask(user.id, form.data.taskId, form.data);
    }

    return null;
};

const validator = withZod(
    z.object({
        taskId: zfd.numeric(z.number().optional()),
        icon: z.string().min(1, 'Please select an icon.').max(2, 'Please use only 1 icon.'),
        name: z.string().min(1, 'Please enter a name.'),
    }),
);

const fields: ResourceFormField[] = [
    {
        label: 'Icon',
        textFieldProps: {
            name: 'icon',
            placeholder: 'Icon',
            maxLength: 2,
        },
    },
    {
        label: 'Name',
        textFieldProps: {
            name: 'name',
            placeholder: 'Vacuum',
        },
    },
];

export default function Page() {
    const { group, chart } = useLoaderData<typeof loader>();

    if (!group) {
        return <div className="py-4">Group not found!</div>;
    }

    if (!chart) {
        return <div className="py-4">Chart not found!</div>;
    }

    const form: ResourceFormPropagatedProps = {
        validator,
        fields,
        hiddenFields: [],
        resource: { type: 'Task' },
    };

    return (
        <section className="pt-4">
            <ResourceDialog form={form} />

            <div className="flex flex-col gap-4 mt-4">
                {chart.tasks.map((task) => (
                    <ResourcePill
                        key={task.id}
                        to={`/groups/${group.id}/charts/${chart.id}/tasks/${task.id}`}
                        form={{
                            ...form,
                            resource: {
                                type: form.resource.type,
                                id: task.id,
                                name: `${task.icon} ${task.name}`,
                            },
                            hiddenFields: form.hiddenFields.concat([
                                { name: 'taskId', value: task.id },
                            ]),
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
