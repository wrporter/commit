import  { type Person } from '#app/lib/models/person.server';
import  { type User , getUserByEmail } from '#app/lib/models/user.server';
import { prisma } from '#app/prisma.server';

export interface Group {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;

    owners?: User[];
    // charts: Chart[];
    people?: Person[];
}

export async function createGroupForUser(userId: User['id'], name: Group['name']): Promise<Group> {
    return prisma.group.create({
        data: { name, owners: { connect: { id: userId } } },
    });
}

export async function updateGroupForUser(userId: User['id'], id: Group['id'], name: Group['name']) {
    return prisma.group.updateMany({
        where: { id, owners: { every: { id: userId } } },
        data: { name },
    });
}

export async function deleteGroupForUser(userId: User['id'], id: Group['id']) {
    return prisma.group.deleteMany({
        where: { id, owners: { every: { id: userId } } },
    });
}

export async function getGroupForUser(userId: User['id'], groupId: Group['id']) {
    return prisma.group.findFirst({
        where: { id: groupId, owners: { every: { id: userId } } },
        include: {
            owners: true,
            people: true,
            charts: true,
        },
    });
}

export async function getGroupsForUser(userId: User['id']) {
    return prisma.group.findMany({
        where: { owners: { every: { id: userId } } },
        include: { people: true },
        orderBy: { updatedAt: 'desc' },
    });
}

export async function shareGroupWithUser(groupId: Group['id'], email: User['email']) {
    const user = await getUserByEmail(email);
    if (!user) {
        throw new Error('User not found.');
    }

    return prisma.group.update({
        where: { id: groupId },
        data: { owners: { connect: [{ id: user.id }] } },
    });
}
