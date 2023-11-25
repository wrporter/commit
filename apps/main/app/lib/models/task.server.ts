import type { TaskAssignment, TaskReward, TaskStatus } from '@prisma/client';

import type { Chart } from '~/lib/models/chart.server';
import type { User } from '~/lib/models/user.server';
import { prisma } from '~/prisma.server';

export interface Task {
    id: number;
    icon: string;
    name: string;
    chartId: number;
    createdAt: Date;
    updatedAt: Date;

    chart: Chart;
    // assignments: TaskAssignment[];
    // rewards: TaskReward[];
    // statuses: TaskStatus[];
}

export async function createTask(data: Pick<Task, 'icon' | 'name' | 'chartId'>) {
    return prisma.task.create({ data });
}

export async function updateTask(
    userId: User['id'],
    taskId: Task['id'],
    data: Pick<Task, 'icon' | 'name'>,
) {
    return prisma.task.updateMany({
        where: {
            id: taskId,
            chart: { groups: { every: { owners: { every: { id: userId } } } } },
        },
        data,
    });
}

export async function deleteTask(userId: User['id'], chartId: number, taskId: Task['id']) {
    return prisma.task.deleteMany({
        where: {
            id: taskId,
            chartId,
            chart: { groups: { every: { owners: { every: { id: userId } } } } },
        },
    });
}

export async function createTaskAssignment(
    data: Pick<TaskAssignment, 'taskId' | 'chartId' | 'personId' | 'day'>,
) {
    return prisma.taskAssignment.create({ data });
}

export async function deleteTaskAssignment(userId: User['id'], id: TaskAssignment['id']) {
    return prisma.taskAssignment.deleteMany({
        where: {
            id,
            chart: { groups: { every: { owners: { every: { id: userId } } } } },
        },
    });
}

export async function createTaskReward(
    data: Pick<TaskReward, 'taskId' | 'chartId' | 'personId' | 'reward'>,
) {
    return prisma.taskReward.create({ data });
}

export async function updateTaskReward(
    userId: User['id'],
    rewardId: TaskReward['id'],
    data: Pick<TaskReward, 'taskId' | 'personId' | 'reward'>,
) {
    return prisma.taskReward.updateMany({
        where: {
            id: rewardId,
            chart: { groups: { every: { owners: { every: { id: userId } } } } },
        },
        data,
    });
}

export async function deleteTaskReward(userId: User['id'], rewardId: TaskReward['id']) {
    return prisma.task.deleteMany({
        where: {
            id: rewardId,
            chart: { groups: { every: { owners: { every: { id: userId } } } } },
        },
    });
}

export async function updateTaskStatus(
    { taskId, chartId, personId, day }: Pick<TaskStatus, 'taskId' | 'chartId' | 'personId' | 'day'>,
    status: 'todo' | 'done',
) {
    const completedAt = status === 'todo' ? null : new Date();

    return prisma.taskStatus.upsert({
        where: { day_taskId: { day, taskId } },
        create: { taskId, chartId, personId, day, completedAt: new Date() },
        update: { completedAt },
    });
}
