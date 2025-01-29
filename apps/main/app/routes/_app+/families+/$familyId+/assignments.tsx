import { PlusIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { ValidatedForm, validationError } from "@rvf/react-router";
import { withZod } from "@rvf/zod";
import { data } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/assignments.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { requireFamilyAccess } from "~/lib/authorization/require-family.js";
import {
  createAssignment,
  deleteAssignment,
  getAssignment,
  getAssignments,
  updateAssignment,
} from "~/lib/repository/assignment.server.js";
import { type Chore, getChores } from "~/lib/repository/chore.server.js";
import { DAYS } from "~/lib/repository/DAYS.js";
import { type Person, getPeople } from "~/lib/repository/person.server.js";
import { Currency } from "~/lib/ui/currency.js";
import {
  ResourceActions,
  type ResourceFormPropagatedProps,
} from "~/lib/ui/resource-actions.js";
import { ResourceAutocomplete } from "~/lib/ui/resource-autocomplete.js";
import { assignmentValidator } from "~/lib/validators.js";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);

  const [people, chores, assignments] = await Promise.all([
    getPeople(family.id),
    getChores(family.id),
    getAssignments(family.id),
  ]);
  return { people, chores, assignments };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);

  if (request.method === "DELETE") {
    const result = await withZod(
      z.object({
        assignmentId: z.string().uuid(),
      })
    ).validate(await request.formData());
    if (result.error) {
      return validationError(result.error, result.submittedData);
    }

    const { assignmentId } = result.data;
    const assignment = await getAssignment(family.id, assignmentId);
    if (!assignment) {
      throw data(
        { errorMessage: `Assignment [${assignmentId}] does not exist` },
        404
      );
    }

    return deleteAssignment(family.id, assignmentId);
  }

  const result = await assignmentValidator.validate(await request.formData());
  if (result.error) {
    return validationError(result.error, result.submittedData);
  }

  if (request.method === "POST") {
    return await createAssignment({
      ...result.data,
      createdBy: user.id,
      familyId: params.familyId,
    });
  }

  if (request.method === "PUT" && result.data.assignmentId) {
    return await updateAssignment({
      ...result.data,
      id: result.data.assignmentId,
      updatedBy: user.id,
    });
  }
};

export default function Component({ loaderData }: Route.ComponentProps) {
  const form: ResourceFormPropagatedProps = {
    validator: assignmentValidator,
    fields: [
      <ResourceAutocomplete<Person>
        key="person"
        label="Person"
        name="person"
        placeholder="Select person"
        isRequired
        displayValue={(person) => person?.name ?? ""}
        resources={loaderData.people}
        className="w-full"
        size="sm"
      />,
      <ResourceAutocomplete<Chore>
        key="chore"
        label="Chore"
        name="chore"
        placeholder="Select chore"
        isRequired
        displayValue={(chore) => chore?.name ?? ""}
        resources={loaderData.chores}
        className="w-full"
        size="sm"
      />,
    ],
    hiddenFields: [],
    resource: { type: "Assignment" },
  };

  return (
    <div className="flex flex-col gap-4">
      {DAYS.map((day, dayOfWeek) => (
        <Table
          key={day}
          aria-label="Table of assignments"
          topContent={
            <h3 className="text-lg text-center font-bold bg-gradient-to-r from-green-200 to-blue-200 rounded-t-lg">
              {day}
            </h3>
          }
          bottomContent={
            <ValidatedForm
              method="post"
              validator={assignmentValidator}
              className="flex flex-col sm:flex-row gap-2 items-center"
            >
              <input type="hidden" name="dayOfWeek" value={dayOfWeek} />

              <div className="flex flex-col sm:flex-row w-full gap-2">
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
                  displayValue={(chore) => chore?.name ?? ""}
                  resources={loaderData.chores}
                  className="w-full"
                  size="sm"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  color="primary"
                  variant="bordered"
                  startContent={<PlusIcon className="size-4" />}
                >
                  Add Chore
                </Button>
              </div>
            </ValidatedForm>
          }
        >
          <TableHeader>
            <TableColumn>Person</TableColumn>
            <TableColumn>Chore</TableColumn>
            <TableColumn className="hidden sm:table-cell">Reward</TableColumn>
            <TableColumn align="end">Actions</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent="No assignments found"
            items={loaderData.assignments.filter(
              (assignment) => assignment.dayOfWeek === dayOfWeek
            )}
          >
            {(assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.personName}</TableCell>
                <TableCell>{assignment.choreName}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Currency value={assignment.choreReward} />
                </TableCell>
                <TableCell>
                  <ResourceActions
                    key={assignment.id}
                    form={{
                      ...form,
                      defaultValues: {
                        person: assignment.personId,
                        chore: assignment.choreId,
                      },
                      resource: {
                        type: form.resource.type,
                        id: assignment.id,
                        name: `${assignment.personName} - ${assignment.choreName}`,
                      },
                      hiddenFields: form.hiddenFields.concat([
                        { name: "assignmentId", value: assignment.id },
                        { name: "dayOfWeek", value: dayOfWeek },
                      ]),
                    }}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      ))}
    </div>
  );
}
