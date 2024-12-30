import { Button, Divider } from "@nextui-org/react";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";

import { useLoaderData } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import invariant from "tiny-invariant";
import { requireUser } from "#app/auth.server.ts";
import { FormInput } from "#app/lib/ui/form-input.tsx";
import {
  choreValidator,
  personValidator,
  rewardValidator,
} from "./_app.home/validators";
import {
  type Chore,
  createChore,
  getChores,
} from "#app/lib/repository/chore.server.ts";
import { createReward, getRewards } from "#app/lib/repository/reward.server.ts";
import { ResourceAutocomplete } from "#app/lib/ui/resource-autocomplete.tsx";
import type { Serialized } from "#app/lib/models/model.ts";
import { getPeople, Person } from "#app/lib/repository/person.server.ts";
import { Currency } from "#app/lib/ui/currency.tsx";
import { getAssignments } from "#app/lib/repository/assignment.server.ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const people = await getPeople(user.id);
  const chores = await getChores(user.id);
  const rewards = await getRewards(user.id);

  return json({ people, chores, rewards });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();

  const form = await rewardValidator.validate(formData);
  invariant(form.data, "No form data");
  await createReward(user.id, form.data);

  return null;
};

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <section className="p-4">
      <div className="flex flex-col">
        <h2 className="text-xl">Rewards</h2>

        <Divider className="mt-1 mb-2" />

        <ValidatedForm
          validator={rewardValidator}
          method="post"
          subaction="createReward"
          className="space-y-2"
        >
          <ResourceAutocomplete<Serialized<Person>>
            label="Person"
            name="person"
            placeholder="Select person"
            isRequired
            displayValue={(person) => person?.name ?? ""}
            resources={data.people}
          />

          <ResourceAutocomplete<Serialized<Chore>>
            label="Chore"
            name="chore"
            placeholder="Select chore"
            isRequired
            displayValue={(chore) =>
              chore ? `${chore.icon} ${chore.name}` : ""
            }
            resources={data.chores}
          />

          <FormInput
            label="Amount"
            name="amount"
            placeholder="0.00"
            isRequired
            type="number"
            step="0.01"
            min="0.00"
            max="100"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">$</span>
              </div>
            }
          />

          <Button type="submit" color="primary" variant="ghost" fullWidth>
            Create
          </Button>
        </ValidatedForm>
      </div>

      <Divider className="my-4" />

      <div className="flex flex-col gap-4 mt-4">
        {data.rewards.map((reward) => {
          const chore = data.chores.find(
            (chore) => chore.id === reward.choreId
          );
          const person = data.people.find(
            (person) => person.id === reward.personId
          );
          const key = `${reward.personId}_${reward.choreId}`;

          return (
            <div className="flex space-x-4" key={key}>
              <div className="text-gray-500">
                <div>Person</div>
                <div>Task</div>
                <div>Reward</div>
              </div>
              <div>
                <div className="font-bold">{person?.name}</div>
                <div>
                  <span>{chore?.icon}</span>
                  <span className="ml-1">{chore?.name}</span>
                </div>
                <Currency value={reward.amount} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
