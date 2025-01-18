import { and, eq } from "drizzle-orm";

import { assignments } from "#server/db-schema.server.js";
import { db } from "#server/db.server.js";

export type Assignment = typeof assignments.$inferSelect;

export async function createAssignment(
  userId: string,
  reward: Pick<Assignment, "personId" | "choreId" | "day">
) {
  const [assignment] = await db
    .insert(assignments)
    .values({ userId, ...reward })
    .returning();
  return assignment;
}

export async function getAssignments(userId: string) {
  return await db
    .select()
    .from(assignments)
    .where(eq(assignments.userId, userId));
}

export async function deleteAssignment(
  userId: string,
  personId: string,
  choreId: string
) {
  return db
    .delete(assignments)
    .where(
      and(
        eq(assignments.userId, userId),
        eq(assignments.personId, personId),
        eq(assignments.choreId, choreId)
      )
    );
}
