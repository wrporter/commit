import { Button, Divider } from "@nextui-org/react";
import { ValidatedForm } from "@rvf/react-router";
import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import invariant from "tiny-invariant";

import type { Route } from "./+types/_app.rewards.js";
import { rewardValidator } from "./_app.home/validators.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { type Chore, getChores } from "~/lib/repository/chore.server.js";
import { type Person, getPeople } from "~/lib/repository/person.server.js";
import { createReward, getRewards } from "~/lib/repository/reward.server.js";
import { Currency } from "~/lib/ui/currency.js";
import { FormInput } from "~/lib/ui/form-input.js";
import { ResourceAutocomplete } from "~/lib/ui/resource-autocomplete.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const people = await getPeople(user.id);
  const chores = await getChores(user.id);
  const rewards = await getRewards(user.id);

  return { people, chores, rewards };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();

  const form = await rewardValidator.validate(formData);
  invariant(form.data, "No form data");
  await createReward(user.id, form.data);

  return null;
};

export default function Component({ loaderData }: Route.ComponentProps) {
  return (
    <section className="p-4">
      <div className="flex flex-col">
        <h2 className="text-xl">Rewards</h2>

        <Divider className="mt-1 mb-2" />

        <ValidatedForm
          validator={rewardValidator}
          method="post"
          className="space-y-2"
        >
          <ResourceAutocomplete<Person>
            label="Person"
            name="person"
            placeholder="Select person"
            isRequired
            displayValue={(person) => person?.name ?? ""}
            resources={loaderData.people}
          />

          <ResourceAutocomplete<Chore>
            label="Chore"
            name="chore"
            placeholder="Select chore"
            isRequired
            displayValue={(chore) =>
              chore ? `${chore.icon} ${chore.name}` : ""
            }
            resources={loaderData.chores}
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
        {loaderData.rewards.map((reward) => {
          const chore = loaderData.chores.find(
            (chore) => chore.id === reward.choreId
          );
          const person = loaderData.people.find(
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
