import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { users } from "#server/db-schema.server.js";
import { db } from "#server/db.server.js";

export type User = typeof users.$inferSelect;

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user;
}

export async function createUser({
  displayName,
  email,
  password,
  imageUrl,
  image,
  socialProviders,
}: Partial<
  Pick<User, "displayName" | "email" | "image" | "imageUrl" | "socialProviders">
> & {
  password?: string;
}): Promise<User> {
  const data: any = {
    displayName,
    email,
    imageUrl,
    image,
    socialProviders,
  };

  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const [user] = await db
    .insert(users)
    .values({ ...data })
    .returning({
      id: users.id,
      email: users.email,
      imageUrl: users.imageUrl,
      image: users.image,
      displayName: users.displayName,
      socialProviders: users.socialProviders,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return user as User;
}

export async function deleteUserByEmail(email: string) {
  return db.delete(users).where(eq(users.email, email));
}

export async function verifyLogin(
  email: string,
  password: string
): Promise<Omit<User, "passwordHash"> | null> {
  const [userWithPassword] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!userWithPassword?.passwordHash) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);

  if (!isValid) {
    return null;
  }

  const { passwordHash: stripPassword, ...userWithoutPassword } =
    userWithPassword;

  return userWithoutPassword;
}
