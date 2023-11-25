import type { TaskReward } from '@prisma/client';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Link, useLoaderData } from '@remix-run/react';
import { TextLink } from '@wesp-up/ui';
import { useState } from 'react';
import { tv } from 'tailwind-variants';

import { DAYS } from '~/lib/models/DAYS';
import type { Serialized } from '~/lib/models/model';
import type { Task } from '~/lib/models/task.server';
import { Currency } from '~/lib/ui/currency';
import { loader as chartLoader } from '~/routes/_app.groups_.$groupId.charts.$chartId';

export const loader = chartLoader;

export default function Page() {
    const { group, chart } = useLoaderData<typeof loader>();
    const today = new Date().toLocaleString('en-us', {
        weekday: 'long',
    }) as (typeof DAYS)[number];
    const dayOfWeek = DAYS.indexOf(today);

    if (!group) {
        return <div className="p-4">Nothing to see here, go create a group!</div>;
    }

    if (!chart) {
        return <div className="p-4">Nothing to see here, go create a chart!</div>;
    }

    const tasks = chart.tasks.reduce(
        (accu, entity) => {
            accu[entity.id] = entity;
            return accu;
        },
        {} as { [key: string]: Serialized<Omit<Task, 'chart'>> },
    );
    const assignmentsForToday = chart.taskAssignments.filter(
        (assignment) => assignment.day === dayOfWeek,
    );

    return (
        <div className="p-4">
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {group.people.map((person) => {
                    const assignments = assignmentsForToday.filter(
                        (assignment) => assignment.personId === person.id,
                    );

                    return (
                        <div
                            key={person.name}
                            className="rounded-md p-4 bg-slate-100 border border-slate-200"
                        >
                            {/* <div className="rounded-md m-2 p-4 bg-slate-100 border border-slate-200"> */}
                            <h3 className="flex justify-center text-lg font-bold border-b border-b-slate-200 pb-2 mb-2">
                                {person.name}
                            </h3>

                            {assignments.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {assignments.map((assignment) => {
                                        const task = tasks[assignment.taskId];
                                        const reward = chart.taskRewards.find(
                                            (reward) =>
                                                reward.taskId === assignment.taskId &&
                                                reward.personId === assignment.personId,
                                        );
                                        return (
                                            <TaskCheckbox
                                                key={assignment.id}
                                                task={task}
                                                reward={reward}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="px-6 py-4 w-full rounded text-lg bg-gradient-to-r from-cyan-200 to-blue-200">
                                    🎉 No tasks today!
                                </div>
                            )}
                            {/* </div> */}
                        </div>
                    );
                })}
            </div>

            <TextLink as={Link} to="/home" className="flex mt-8">
                Take me home
            </TextLink>
        </div>
    );
}

const taskVariants = tv({
    base: [
        'px-6 py-4 w-full bg-white rounded text-lg',
        'flex justify-between items-center',
        'hover:bg-blue-100',
    ],
    variants: {
        done: {
            true: 'line-through opacity-50',
            false: '',
        },
    },
});

function TaskCheckbox({
    task,
    reward,
    className,
}: {
    task: Serialized<Omit<Task, 'chart'>>;
    reward?: Serialized<TaskReward>;
    className?: string;
}) {
    const [done, setDone] = useState(false);

    return (
        <Checkbox.Root
            checked={done}
            onCheckedChange={() => setDone((v) => !v)}
            className={taskVariants({ done, className })}
        >
            <span>
                {task.icon} {task.name}
            </span>
            {reward ? (
                <Currency value={reward.reward} />
            ) : (
                <span className="text-gray-400">No reward</span>
            )}
        </Checkbox.Root>
    );
}
