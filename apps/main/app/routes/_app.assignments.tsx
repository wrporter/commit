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
import { FormInput } from "#app/lib/ui/form-input.tsx";
import {
  assignmentValidator,
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
import {
  createAssignment,
  getAssignments,
} from "#app/lib/repository/assignment.server.ts";
import { DAYS } from "#app/lib/models/DAYS.ts";
import { groupBy } from "#app/lib/group-by.ts";
import { FormErrors } from "#app/lib/ui/resource-pill.tsx";
import { TrashIcon } from "@heroicons/react/24/outline";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const people = await getPeople(user.id);
  const chores = await getChores(user.id);
  const rewards = await getRewards(user.id);
  const assignments = await getAssignments(user.id);

  return json({ people, chores, rewards, assignments });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();

  const form = await assignmentValidator.validate(formData);
  invariant(form.data, "No form data");
  await createAssignment(user.id, form.data);

  return null;
};

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <section className="p-4">
      <div className="flex flex-col">
        <h2 className="text-xl">Assignments</h2>

        {DAYS.map((day, dayOfWeek) => {
          const assignments = groupBy(
            data.assignments.filter(
              (assignment) => assignment.day === dayOfWeek
            ),
            "personId"
          );

          const people = data.people.reduce((accu, entity) => {
            accu[entity.id] = entity;
            return accu;
          }, {} as { [key: string]: Serialized<Person> });

          const chores = data.chores.reduce((accu, entity) => {
            accu[entity.id] = entity;
            return accu;
          }, {} as { [key: string]: Serialized<Chore> });

          return (
            <div key={day}>
              <h3 className="text-lg text-center font-bold my-6 bg-gradient-to-r from-green-200 to-blue-200">
                {day}
              </h3>

              <div className="space-y-4">
                {Object.entries(assignments).map(([personId, assignments]) => {
                  const person = people[personId];

                  return (
                    <div key={personId} className="space-y-2">
                      <div className="font-bold">{person?.name}</div>

                      {assignments.map((assignment) => {
                        const chore = chores[assignment.choreId];
                        const key = `${assignment.personId}_${assignment.choreId}`;

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between hover:bg-blue-100"
                          >
                            <div>
                              {chore?.icon} {chore?.name}
                            </div>

                            <Form
                              action={key}
                              // action={`/groups/${group.id}/charts/${chart.id}/assignments/${assignment.id}`}
                              method="DELETE"
                              id="deleteAssignment"
                              navigate={false}
                              className="h-8"
                            >
                              <Button
                                color="danger"
                                type="submit"
                                size="sm"
                                isIconOnly
                                aria-label="Delete"
                              >
                                <TrashIcon className="h-6 w-6" />
                              </Button>
                            </Form>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <ValidatedForm
                method="post"
                subaction="createAssignment"
                validator={assignmentValidator}
                className="flex gap-2 items-end mt-4 pt-4"
              >
                <input type="hidden" name="day" value={dayOfWeek} />

                <div className="flex flex-1 gap-2">
                  <ResourceAutocomplete<Serialized<Person>>
                    label="Person"
                    name="person"
                    placeholder="Select person"
                    isRequired
                    displayValue={(person) => person?.name ?? ""}
                    resources={data.people}
                    className="w-full"
                    size="sm"
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
                    className="w-full"
                    size="sm"
                  />
                </div>

                <Button type="submit" color="primary" variant="ghost">
                  Add
                </Button>

                <FormErrors formId="createAssignment" />
              </ValidatedForm>
            </div>
          );
        })}
      </div>
    </section>
  );
}
