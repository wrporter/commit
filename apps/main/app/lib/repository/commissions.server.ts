import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "#server/db.server.js";
import {
  chores,
  commissions,
  people,
} from "#server/schema/db-schema.server.js";

export type Commission = typeof commissions.$inferSelect;

export async function createCommission(
  commission: Pick<
    Commission,
    | "familyId"
    | "assignmentId"
    | "personId"
    | "choreId"
    | "choreName"
    | "date"
    | "baseAmount"
    | "rating"
    | "finalAmount"
  >
) {
  const [fullCommission] = await db
    .insert(commissions)
    .values({ ...commission, balance: commission.finalAmount })
    .returning();
  return fullCommission;
}

export function getCommissionsForDate(familyId: string, date: string) {
  return db
    .select({
      ...getTableColumns(commissions),
      personName: people.name,
      choreName: sql<string>`COALESCE(${chores.name}, ${commissions.choreName})`,
    })
    .from(commissions)
    .innerJoin(people, eq(people.id, commissions.personId))
    .leftJoin(chores, eq(chores.id, commissions.choreId))
    .where(and(eq(commissions.familyId, familyId), eq(commissions.date, date)));
}

export function getCommissions(familyId: string) {
  return db
    .select()
    .from(commissions)
    .where(eq(commissions.familyId, familyId))
    .orderBy(desc(commissions.date), desc(commissions.personId));
}

export function deleteCommission(familyId: string, commissionId: string) {
  return db
    .delete(commissions)
    .where(
      and(eq(commissions.familyId, familyId), eq(commissions.id, commissionId))
    );
}

export function payCommissions(familyId: string, personId: string) {
  return db
    .update(commissions)
    .set({ balance: "0", paidAt: new Date() })
    .where(
      and(
        eq(commissions.familyId, familyId),
        eq(commissions.personId, personId)
      )
    );
}
