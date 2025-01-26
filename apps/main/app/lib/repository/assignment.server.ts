import { and, eq, getTableColumns } from "drizzle-orm";

import { db } from "#server/db.server.js";
import {
  choreAssignments,
  chores,
  people,
} from "#server/schema/db-schema.server.js";

export type Assignment = typeof choreAssignments.$inferSelect;

export async function createAssignment(
  assignment: Pick<
    Assignment,
    "familyId" | "personId" | "choreId" | "dayOfWeek" | "createdBy"
  >
) {
  const [fullAssignment] = await db
    .insert(choreAssignments)
    .values({ ...assignment, updatedBy: assignment.createdBy })
    .returning();
  return fullAssignment;
}

export async function updateAssignment(
  assignment: Pick<Assignment, "id" | "personId" | "choreId" | "updatedBy">
) {
  return db
    .update(choreAssignments)
    .set({ ...assignment, updatedAt: new Date() })
    .where(eq(choreAssignments.id, assignment.id));
}

export function getAssignments(familyId: string) {
  return db
    .select({
      ...getTableColumns(choreAssignments),
      personName: people.name,
      choreName: chores.name,
      choreReward: chores.reward,
    })
    .from(choreAssignments)
    .innerJoin(people, eq(people.id, choreAssignments.personId))
    .innerJoin(chores, eq(chores.id, choreAssignments.choreId))
    .where(eq(choreAssignments.familyId, familyId));
}

export async function getAssignment(familyId: string, assignmentId: string) {
  const [assignment] = await db
    .select()
    .from(choreAssignments)
    .where(
      and(
        eq(choreAssignments.familyId, familyId),
        eq(choreAssignments.id, assignmentId)
      )
    )
    .limit(1);
  return assignment;
}

export async function deleteAssignment(familyId: string, assignmentId: string) {
  return db
    .delete(choreAssignments)
    .where(
      and(
        eq(choreAssignments.familyId, familyId),
        eq(choreAssignments.id, assignmentId)
      )
    );
}
