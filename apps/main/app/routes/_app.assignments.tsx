import { TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@nextui-org/react";
import { ValidatedForm } from "@rvf/react-router";
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
} from "react-router";
import invariant from "tiny-invariant";

import type { Route } from "./+types/_app.assignments.js";
import { assignmentValidator } from "./_app.home/validators.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { groupBy } from "~/lib/group-by.js";
import {
  createAssignment,
  getAssignments,
} from "~/lib/repository/assignment.server.js";
import { type Chore, getChores } from "~/lib/repository/chore.server.js";
import { DAYS } from "~/lib/repository/DAYS.js";
import { type Person, getPeople } from "~/lib/repository/person.server.js";
import { getRewards } from "~/lib/repository/reward.server.js";
import { ResourceAutocomplete } from "~/lib/ui/resource-autocomplete.js";
import { FormErrors } from "~/lib/ui/resource-pill.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const people = await getPeople(user.id);
  const chores = await getChores(user.id);
  const rewards = await getRewards(user.id);
  const assignments = await getAssignments(user.id);

  return { people, chores, rewards, assignments };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();

  const form = await assignmentValidator.validate(formData);
  invariant(form.data, "No form data");
  await createAssignment(user.id, form.data);

  return null;
};

export default function Component({ loaderData }: Route.ComponentProps) {
  return (
    <section className="p-4">
      <div className="flex flex-col">
        <h2 className="text-xl">Assignments</h2>

        {DAYS.map((day, dayOfWeek) => {
          const assignments = groupBy(
            loaderData.assignments.filter(
              (assignment) => assignment.day === dayOfWeek
            ),
            "personId"
          );

          const people = loaderData.people.reduce((accu, entity) => {
            accu[entity.id] = entity;
            return accu;
          }, {} as { [key: string]: Person });

          const chores = loaderData.chores.reduce((accu, entity) => {
            accu[entity.id] = entity;
            return accu;
          }, {} as { [key: string]: Chore });

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
                validator={assignmentValidator}
                className="flex gap-2 items-end mt-4 pt-4"
              >
                <input type="hidden" name="day" value={dayOfWeek} />

                <div className="flex flex-1 gap-2">
                  <ResourceAutocomplete<Person>
                    label="Person"
                    name="person"
                    placeholder="Select person"
                    isRequired
                    displayValue={(person) => person?.name ?? ""}
                    resources={loaderData.people}
                    className="w-full"
                    size="sm"
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
                    className="w-full"
                    size="sm"
                  />
                </div>

                <Button type="submit" color="primary" variant="ghost">
                  Add
                </Button>

                <FormErrors />
              </ValidatedForm>
            </div>
          );
        })}
      </div>
    </section>
  );
}
