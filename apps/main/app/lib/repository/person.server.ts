import { and, eq, getTableColumns } from "drizzle-orm";

import { db } from "#server/db.server.js";
import {
  families,
  familyUsers,
  people,
} from "#server/schema/db-schema.server.js";

export type Person = typeof people.$inferSelect;

export async function createPerson(
  person: Pick<Person, "familyId" | "createdBy" | "name" | "birthday">
) {
  const [fullPerson] = await db
    .insert(people)
    .values({ ...person, updatedBy: person.createdBy })
    .returning();
  return fullPerson;
}

export async function getPerson(
  userId: string,
  familyId: string,
  personId: string
) {
  return db
    .select(getTableColumns(people))
    .from(people)
    .innerJoin(families, eq(families.id, people.familyId))
    .innerJoin(familyUsers, eq(familyUsers.userId, people.familyId))
    .where(
      and(
        eq(familyUsers.userId, userId),
        eq(people.familyId, familyId),
        eq(people.id, personId)
      )
    );
}

export async function getPeople(familyId: string) {
  return db.select().from(people).where(eq(people.familyId, familyId));
}

export async function updatePerson(
  person: Pick<Person, "id" | "name" | "birthday" | "updatedBy">
) {
  return db
    .update(people)
    .set({ ...person, updatedAt: new Date() })
    .where(eq(people.id, person.id));
}

export async function deletePerson(familyId: string, personId: string) {
  return db
    .delete(people)
    .where(and(eq(people.familyId, familyId), eq(people.id, personId)));
}
