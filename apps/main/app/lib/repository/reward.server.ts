import { and, eq } from "drizzle-orm";
import { db } from "#app/lib/repository/db.server.ts";
import { rewards } from "#server/db-schema.server.ts";

export type Reward = typeof rewards.$inferSelect;

export async function createReward(
  userId: string,
  reward: Pick<Reward, "personId" | "choreId" | "amount">
) {
  const [person] = await db
    .insert(rewards)
    .values({ userId, ...reward })
    .returning();
  return person as Reward;
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
