import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
} from "react-router";

import type { Route } from "./+types/route.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { getAssignments } from "~/lib/repository/assignment.server.js";
import { getChores } from "~/lib/repository/chore.server.js";
import { getPeople } from "~/lib/repository/person.server.js";
import { getRewards } from "~/lib/repository/reward.server.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const people = await getPeople(user.id);
  const chores = await getChores(user.id);
  const rewards = await getRewards(user.id);
  const assignments = await getAssignments(user.id);

  return data({ people, chores, rewards, assignments });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireUser(request);
  return null;
};

export default function Component({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col md:flex-row p-4 gap-4">
      <h1>Home</h1>
      <pre>{JSON.stringify(loaderData, null, 4)}</pre>
    </div>
  );
}
