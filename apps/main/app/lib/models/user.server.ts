import bcrypt from 'bcryptjs';

import  { type Group } from '#app/lib/models/group.server';
import { prisma } from '#app/prisma.server';

export interface Password {
    id: number;
    hash: string;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: number;
    email: string;
    imageUrl: string | null;
    image: string | null;
    displayName: string;
    socialProviders: { [provider: string]: boolean };
    createdAt: Date;
    updatedAt: Date;

    password?: Password;
    groups?: Group[];
}

export async function getUserById(id: User['id']) {
    return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User['email']) {
    return prisma.user.findUnique({ where: { email } });
}

export async function createUser({
    displayName,
    email,
    password,
    imageUrl,
    image,
    socialProviders,
}: Partial<Pick<User, 'displayName' | 'email' | 'image' | 'imageUrl' | 'socialProviders'>> & {
    password?: string;
}) {
    const data: any = {
        displayName,
        email,
        imageUrl,
        image,
        socialProviders,
    };

    if (password) {
        data.password = {
            create: {
                hash: await bcrypt.hash(password, 10),
            },
        };
    }

    return prisma.user.create({ data });
}

export async function deleteUserByEmail(email: string) {
    return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(email: User['email'], password: Password['hash']) {
    const userWithPassword = await prisma.user.findUnique({
        where: { email },
        include: {
            password: true,
        },
    });

    if (!userWithPassword?.password) {
        return null;
    }

    const isValid = await bcrypt.compare(password, userWithPassword.password.hash);

    if (!isValid) {
        return null;
    }

    const { password: stripPassword, ...userWithoutPassword } = userWithPassword;

    return userWithoutPassword;
}
