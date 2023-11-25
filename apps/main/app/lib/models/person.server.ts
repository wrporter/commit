import type { TaskAssignment, TaskReward } from '@prisma/client';

import type { Chart } from '~/lib/models/chart.server';
import type { Group } from '~/lib/models/group.server';
import type { User } from '~/lib/models/user.server';
import { prisma } from '~/prisma.server';

export interface Person {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;

    groups: Group[];
    charts: Chart[];
    taskAssignments: TaskAssignment[];
    taskRewards: TaskReward[];
    // taskStatuses: TaskStatus[];
    // commissions: Commission[];
}

export async function getPeopleForUser(userId: User['id']) {
    return prisma.person.findMany({
        where: { groups: { every: { owners: { every: { id: userId } } } } },
        include: { groups: true },
    });
}

export async function createPerson(groupId: Group['id'], name: Person['name']) {
    return prisma.person.create({
        data: { name, groups: { connect: { id: groupId } } },
    });
}

export async function updatePersonForUser(
    userId: User['id'],
    personId: Person['id'],
    name: Person['name'],
) {
    return prisma.person.updateMany({
        where: {
            id: personId,
            groups: { every: { owners: { every: { id: userId } } } },
        },
        data: { name },
    });
}

export async function deletePersonForUser(userId: User['id'], personId: Person['id']) {
    return prisma.person.deleteMany({
        where: {
            id: personId,
            groups: { every: { owners: { every: { id: userId } } } },
        },
    });
}
