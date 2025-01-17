import { and, eq } from "drizzle-orm";

import { rewards } from "#server/db-schema.server.js";
import { db } from "~/lib/repository/db.server.js";

export type Reward = typeof rewards.$inferSelect;

export async function createReward(
  userId: string,
  reward: Pick<Reward, "personId" | "choreId" | "amount">
) {
  const [person] = await db
    .insert(rewards)
    .values({ userId, ...reward })
    .returning();
  return person;
}

export async function getRewards(userId: string) {
  return await db.select().from(rewards).where(eq(rewards.userId, userId));
}

export async function deleteReward(
  userId: string,
  personId: string,
  choreId: string
) {
  return db
    .delete(rewards)
    .where(
      and(
        eq(rewards.userId, userId),
        eq(rewards.personId, personId),
        eq(rewards.choreId, choreId)
      )
    );
}
