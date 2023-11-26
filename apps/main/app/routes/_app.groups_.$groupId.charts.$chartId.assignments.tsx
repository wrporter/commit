import { TrashIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { Button } from '@wesp-up/ui';
import React from 'react';
import { ValidatedForm, validationError } from 'remix-validated-form';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { requireUser } from '~/auth.server';
import { groupBy } from '~/lib/group-by';
import { getChartForUser } from '~/lib/models/chart.server';
import { DAYS } from '~/lib/models/DAYS';
import { getGroupForUser } from '~/lib/models/group.server';
import type { Serialized } from '~/lib/models/model';
import type { Person } from '~/lib/models/person.server';
import type { Task } from '~/lib/models/task.server';
import { createTaskAssignment } from '~/lib/models/task.server';
import { ResourceCombobox } from '~/lib/ui/resource-combobox';
import { FormErrors } from '~/lib/ui/resource-pill';
import { loader as chartLoader } from '~/routes/_app.groups_.$groupId.charts.$chartId';

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

    const form = await validator.validate(await request.formData());
    if (form.error) {
        return validationError(form.error);
    }

    const assignment = {
        chartId,
        day: form.data.day,
        personId: form.data.person.id,
        taskId: form.data.task.id,
    };

    if (request.method === 'POST') {
        const task = createTaskAssignment(assignment);
        return json(task);
    }
    //
    // invariant(form.data.taskId, 'No chartId found');
    // if (request.method === 'DELETE') {
    //     return deleteTask(user.id, form.data.taskId);
    // }
    //
    // if (request.method === 'PUT') {
    //     invariant(form.data.name, 'No name found');
    //     return updateTask(user.id, form.data.taskId, form.data);
    // }

    return null;
};

const validator = withZod(
    z.object({
        day: zfd.numeric(z.number()),
        person: z.object({ id: zfd.numeric(z.number()) }),
        task: z.object({ id: zfd.numeric(z.number()) }),
    }),
);

export default function Page() {
    const { group, chart } = useLoaderData<typeof loader>();

    if (!group) {
        return <div className="py-4">Group not found!</div>;
    }

    if (!chart) {
        return <div className="py-4">Chart not found!</div>;
    }

    const people = group.people.reduce(
        (accu, entity) => {
            // @ts-ignore
            accu[entity.id] = entity;
            return accu;
        },
        {} as { [key: string]: Serialized<Person> },
    );

    const tasks = chart.tasks.reduce(
        (accu, entity) => {
            accu[entity.id] = entity;
            return accu;
        },
        {} as { [key: string]: Serialized<Omit<Task, 'chart'>> },
    );

    return (
        <section className="pb-10">
            {DAYS.map((day, dayOfWeek) => {
                const assignments = groupBy(
                    chart.taskAssignments.filter((assignment) => assignment.day === dayOfWeek),
                    'personId',
                );

                return (
                    <div key={day}>
                        <h3 className="text-lg text-center font-bold my-6 bg-gradient-to-r from-green-200 to-blue-200">
                            {day}
                        </h3>

                        <div className="space-y-4">
                            {Object.entries(assignments).map(([personId, assignments]) => {
                                const person = people[personId];

                                return (
                                    <div key={personId} className="space-y-2">
                                        <div className="font-bold">{person.name}</div>

                                        {assignments.map((assignment) => {
                                            const task = tasks[assignment.taskId];
                                            return (
                                                <div
                                                    key={assignment.id}
                                                    className="flex items-center justify-between hover:bg-blue-100"
                                                >
                                                    <div>
                                                        {task.icon} {task.name}
                                                    </div>

                                                    <Form
                                                        action={`${assignment.id}`}
                                                        // action={`/groups/${group.id}/charts/${chart.id}/assignments/${assignment.id}`}
                                                        method="DELETE"
                                                        id="deleteTaskAssignment"
                                                        navigate={false}
                                                    >
                                                        <Button
                                                            kind="danger"
                                                            type="submit"
                                                            small
                                                            className="w-8"
                                                        >
                                                            <TrashIcon className="h-8 w-8" />
                                                        </Button>
                                                    </Form>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        <ValidatedForm
                            method="POST"
                            id="createTaskAssignment"
                            validator={validator}
                            className="flex gap-2 items-end mt-4 pt-4"
                        >
                            <input type="hidden" name="day" value={dayOfWeek} />

                            <div className="flex flex-1 gap-2">
                                <ResourceCombobox<Serialized<Person>>
                                    displayValue={(person: Serialized<Person>) => person.name}
                                    resources={group.people as Serialized<Person[]>}
                                    label="Person"
                                    formName="person"
                                    placeholder="Select person"
                                    className="w-full"
                                />
                                <ResourceCombobox<Serialized<Task>>
                                    displayValue={(task: Serialized<Task>) =>
                                        `${task.icon} ${task.name}`
                                    }
                                    resources={chart.tasks as Serialized<Task[]>}
                                    label="Task"
                                    formName="task"
                                    placeholder="Select task"
                                    className="w-full"
                                />
                            </div>

                            <Button type="submit" kind="secondary">
                                Add
                            </Button>

                            <FormErrors formId="createTaskAssignment" />
                        </ValidatedForm>
                    </div>
                );
            })}
        </section>
    );
}
