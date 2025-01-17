import { and, eq } from "drizzle-orm";

import { people } from "#server/db-schema.server.js";
import { db } from "~/lib/repository/db.server.js";

export type Person = typeof people.$inferSelect;

export async function createPerson(
  userId: string,
  name: string,
  birthday: string
) {
  const [person] = await db
    .insert(people)
    .values({ userId, name, birthday })
    .returning();
  return person;
}

export async function getPeople(userId: string) {
  return (await db
    .select()
    .from(people)
    .where(eq(people.userId, userId))) as Person[];
}

export async function deletePerson(userId: string, personId: string) {
  await db
    .delete(people)
    .where(and(eq(people.userId, userId), eq(people.id, personId)));
}
