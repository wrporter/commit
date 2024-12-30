import { and, eq } from "drizzle-orm";
import { db } from "#app/lib/repository/db.server.ts";
import { chores } from "#server/db-schema.server.ts";

export type Chore = typeof chores.$inferSelect;

export async function createChore(
  userId: string,
  chore: Pick<Chore, "icon" | "name">
) {
  const [person] = await db
    .insert(chores)
    .values({ userId, ...chore })
    .returning();
  return person as Chore;
}

export async function getChores(userId: string) {
  return await db.select().from(chores).where(eq(chores.userId, userId));
}

export async function deleteChore(userId: string, choreId: string) {
  return db
    .delete(chores)
    .where(and(eq(chores.userId, userId), eq(chores.id, choreId)));
}
