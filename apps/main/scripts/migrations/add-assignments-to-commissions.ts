/**
 * 2025-01-29
 * A new column, assignment_id, has been added to commissions. This script populates all historical
 * commissions with an assignment_id when the chore_id and date from a commission match the day and
 * chore_id from an assignment.
 */
import { getDayOfWeek, parseDate } from "@internationalized/date";
import { log } from "@wesp-up/express";
import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "#server/db.server.js";
import {
  choreAssignments,
  commissions,
} from "#server/schema/db-schema.server.js";

log.info("Starting migration");

await Promise.all(
  (
    await db.select().from(commissions).where(isNotNull(commissions.choreId))
  ).map(async (commission) => {
    const dayOfWeek = getDayOfWeek(parseDate(commission.date), "en-US", "mon");
    const assignments = await db
      .select()
      .from(choreAssignments)
      .where(
        and(
          eq(choreAssignments.choreId, commission.choreId ?? ""),
          eq(choreAssignments.personId, commission.personId),
          eq(choreAssignments.dayOfWeek, dayOfWeek)
        )
      );

    if (assignments.length > 1) {
      const message = "There are too many assignments for this commission.";
      log.error({
        message: message,
        commission,
      });
      throw new Error(message);
    }

    if (assignments.length === 1) {
      const [assignment] = assignments;
      await db
        .update(commissions)
        .set({ assignmentId: assignment.id })
        .where(eq(commissions.id, commission.id));
      log.info({
        message: "Linked commission and assignment.",
        commissionId: commission.id,
        assignmentId: assignment.id,
      });
    } else {
      log.info({
        message: "No assignment for commission.",
        commissionId: commission.id,
      });
    }
  })
);

await db.$client.end();
log.info("Successfully finished migration");
