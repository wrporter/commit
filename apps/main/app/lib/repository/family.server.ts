import { and, eq, getTableColumns } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";

import { db } from "#server/db.server.js";
import { families, familyUsers } from "#server/schema/db-schema.server.js";

export type Family = typeof families.$inferSelect;

export async function getFamilies(userId: string) {
  return db
    .select(getTableColumns(families))
    .from(families)
    .innerJoin(familyUsers, eq(familyUsers.familyId, families.id))
    .where(eq(familyUsers.userId, userId));
}

export async function getFamily(userId: string, familyId: string) {
  const [family] = await db
    .select(getTableColumns(families))
    .from(families)
    .innerJoin(
      familyUsers,
      and(eq(familyUsers.familyId, families.id), eq(familyUsers.userId, userId))
    )
    .where(eq(families.id, familyId))
    .limit(1);
  return family;
}

export async function createFamily(family: Pick<Family, "name" | "createdBy">) {
  const familyId = uuidv7();
  return db.transaction(async (tx) => {
    const [[fullFamily]] = await Promise.all([
      tx
        .insert(families)
        .values({ id: familyId, ...family, updatedBy: family.createdBy })
        .returning(),
      tx.insert(familyUsers).values({
        familyId,
        userId: family.createdBy,
        createdBy: family.createdBy,
        updatedBy: family.createdBy,
      }),
    ]);
    return fullFamily;
  });
}

export async function updateFamily(
  family: Pick<Family, "id" | "name" | "updatedBy">
) {
  return db
    .update(families)
    .set({ ...family, updatedAt: new Date() })
    .where(eq(families.id, family.id));
}

export async function deleteFamily(familyId: string) {
  return db.transaction(async (tx) => {
    await tx.delete(familyUsers).where(eq(familyUsers.familyId, familyId));
    await tx.delete(families).where(eq(families.id, familyId));
  });
}
