import { and, eq } from "drizzle-orm";

import { chores } from "#server/db-schema.server.js";
import { db } from "~/lib/repository/db.server.js";

export type Chore = typeof chores.$inferSelect;

export async function createChore(
  userId: string,
  chore: Pick<Chore, "icon" | "name">
) {
  const [person] = await db
    .insert(chores)
    .values({ userId, ...chore })
    .returning();
  return person;
}

export async function getChores(userId: string) {
  return await db.select().from(chores).where(eq(chores.userId, userId));
}

export async function deleteChore(userId: string, choreId: string) {
  return db
    .delete(chores)
    .where(and(eq(chores.userId, userId), eq(chores.id, choreId)));
}
