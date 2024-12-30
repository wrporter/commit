import { TrashIcon } from "@heroicons/react/24/outline";
import { Button, Divider } from "@nextui-org/react";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";

import { Form, useLoaderData } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import invariant from "tiny-invariant";
import { requireUser } from "#app/auth.server.ts";
import { groupBy } from "#app/lib/group-by.ts";
import { DAYS } from "#app/lib/models/DAYS.ts";
import { type Serialized } from "#app/lib/models/model.ts";
import {
  createAssignment,
  getAssignments,
} from "#app/lib/repository/assignment.server.ts";
import {
  type Chore,
  createChore,
  getChores,
} from "#app/lib/repository/chore.server.ts";
import {
  createPerson,
  getPeople,
  type Person,
} from "#app/lib/repository/person.server.ts";
import { createReward, getRewards } from "#app/lib/repository/reward.server.ts";
import { Currency } from "#app/lib/ui/currency.tsx";
import { FormInput } from "#app/lib/ui/form-input.tsx";
import { ResourceAutocomplete } from "#app/lib/ui/resource-autocomplete.tsx";
import { FormErrors } from "#app/lib/ui/resource-pill.tsx";
import {
  rewardValidator,
  choreValidator,
  personValidator,
  assignmentValidator,
} from "./validators";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const people = await getPeople(user.id);
  const chores = await getChores(user.id);
  const rewards = await getRewards(user.id);
  const assignments = await getAssignments(user.id);

  return json({ people, chores, rewards, assignments });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireUser(request);
  return null;
};

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return <div className="flex flex-col md:flex-row p-4 gap-4">Home</div>;
}
