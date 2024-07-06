import  { type ActionFunctionArgs , json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import React from 'react';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { requireUser } from '#app/auth.server';
import { createChart, deleteChart, updateChart } from '#app/lib/models/chart.server';
import { getGroupForUser } from '#app/lib/models/group.server';
import  { type ResourceFormField, type ResourceFormPropagatedProps , ResourceModal, ResourcePill } from '#app/lib/ui/resource-pill';
import { loader as groupLoader } from '#app/routes/_app.groups_.$groupId';

export const loader = groupLoader;

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const user = await requireUser(request);

    const groupId = Number.parseInt(params.groupId ?? '0', 10);
    invariant(groupId, 'Group not found');
    const group = await getGroupForUser(user.id, groupId);
    invariant(group, 'Unauthorized');

    const form = await validator.validate(await request.formData());
    invariant(form.data, 'No form data');

    if (request.method === 'POST') {
        invariant(form.data.name, 'No name found');
        const chart = createChart(group.id, form.data.name);
        return json(chart);
    }

    invariant(form.data.chartId, 'No chartId found');
    if (request.method === 'DELETE') {
        return deleteChart(form.data.chartId);
    }

    if (request.method === 'PUT') {
        invariant(form.data.name, 'No name found');
        return updateChart(form.data.chartId, form.data.name);
    }

    return null;
};

const validator = withZod(
    z.object({
        chartId: zfd.numeric(z.number().optional()),
        name: z.string().min(1, 'Please enter a name.').optional(),
        people: z.array(z.object({ id: zfd.numeric(), name: z.string() })).optional(),
    }),
);

const fields: ResourceFormField[] = [
    {
        label: 'Name',
        textFieldProps: {
            name: 'name',
            placeholder: 'Chore Chart',
        },
    },
];

export default function Page() {
    const { group } = useLoaderData<typeof loader>();

    if (!group) {
        return <div className="py-4">Group not found!</div>;
    }

    const form: ResourceFormPropagatedProps = {
        validator,
        fields,
        hiddenFields: [],
        resource: { type: 'Chart' },
    };

    return (
        <section>
            <div className="flex justify-between items-center">
                <h2 className="text-xl">Charts</h2>

                <ResourceModal form={form} />
            </div>

            <Outlet />

            <div className="flex flex-col gap-4 mt-4">
                {group.charts.map((chart) => (
                    <ResourcePill
                        key={chart.id}
                        to={`/groups/${group.id}/charts/${chart.id}/tasks`}
                        form={{
                            ...form,
                            resource: {
                                type: form.resource.type,
                                id: chart.id,
                                name: chart.name,
                            },
                            hiddenFields: form.hiddenFields.concat([
                                { name: 'chartId', value: chart.id },
                            ]),
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
