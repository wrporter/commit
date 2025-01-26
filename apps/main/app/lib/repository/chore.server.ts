import { and, eq } from "drizzle-orm";

import { db } from "#server/db.server.js";
import { chores } from "#server/schema/db-schema.server.js";

export type Chore = typeof chores.$inferSelect;
export type ChoreInsert = typeof chores.$inferInsert;

export async function createChore(
  chore: Pick<ChoreInsert, "familyId" | "createdBy" | "name" | "reward">
) {
  const [fullChore] = await db
    .insert(chores)
    .values({ ...chore, updatedBy: chore.createdBy })
    .returning();
  return fullChore;
}

export async function updateChore(
  chore: Pick<Chore, "id" | "name" | "reward" | "updatedBy">
) {
  return db
    .update(chores)
    .set({ ...chore, updatedAt: new Date() })
    .where(eq(chores.id, chore.id));
}

export function getChores(familyId: string) {
  return db.select().from(chores).where(eq(chores.familyId, familyId));
}

export async function getChore(familyId: string, choreId: string) {
  const [chore] = await db
    .select()
    .from(chores)
    .where(and(eq(chores.familyId, familyId), eq(chores.id, choreId)))
    .limit(1);
  return chore;
}

export async function deleteChore(familyId: string, choreId: string) {
  return db
    .delete(chores)
    .where(and(eq(chores.familyId, familyId), eq(chores.id, choreId)));
}
