import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { validationError } from "@rvf/react-router";
import { withZod } from "@rvf/zod";
import { data } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/chores.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { requireFamilyAccess } from "~/lib/authorization/require-family.js";
import {
  createChore,
  deleteChore,
  getChore,
  getChores,
  updateChore,
} from "~/lib/repository/chore.server.js";
import { Currency } from "~/lib/ui/currency.js";
import { FormInput } from "~/lib/ui/form-input.js";
import {
  ResourceActions,
  type ResourceFormPropagatedProps,
  ResourceModal,
} from "~/lib/ui/resource-actions.js";
import { choreValidator } from "~/lib/validators.js";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);

  const chores = await getChores(family.id);
  return { chores };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);

  if (request.method === "DELETE") {
    const result = await withZod(
      z.object({ choreId: z.string().uuid() })
    ).validate(await request.formData());
    if (result.error) {
      return validationError(result.error, result.submittedData);
    }

    const choreId = result.data.choreId;
    const chore = await getChore(family.id, choreId);
    if (!chore) {
      throw data({ errorMessage: `Chore [${choreId}] does not exist` }, 404);
    }

    return deleteChore(family.id, choreId);
  }

  const result = await choreValidator.validate(await request.formData());
  if (result.error) {
    return validationError(result.error, result.submittedData);
  }

  if (request.method === "POST") {
    return await createChore({
      ...result.data,
      reward: result.data.reward.toFixed(2),
      createdBy: user.id,
      familyId: params.familyId,
    });
  }

  if (request.method === "PUT" && result.data.choreId) {
    return await updateChore({
      ...result.data,
      id: result.data.choreId,
      reward: result.data.reward.toFixed(2),
      updatedBy: user.id,
    });
  }
};

export default function Component({ loaderData }: Route.ComponentProps) {
  const form: ResourceFormPropagatedProps = {
    validator: choreValidator,
    fields: [
      // <FormImagePicker key="image" name="image" label="Image" />,
      <FormInput
        type="text"
        key="name"
        name="name"
        label="Name"
        placeholder="Vacuum"
      />,
      <FormInput
        type="number"
        key="reward"
        name="reward"
        label="Reward"
        placeholder="1.50"
        startContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-500 text-small">$</span>
          </div>
        }
      />,
    ],
    hiddenFields: [],
    resource: { type: "Chore" },
  };

  return (
    <Table
      aria-label="Table of chores"
      topContent={
        <div className="flex justify-between items-center">
          <h2 className="text-xl">Chores</h2>
          <ResourceModal form={form} />
        </div>
      }
      topContentPlacement="outside"
    >
      <TableHeader>
        {/*<TableColumn>Image</TableColumn>*/}
        <TableColumn>Name</TableColumn>
        <TableColumn>Reward</TableColumn>
        <TableColumn align="end">Actions</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No chores found" items={loaderData.chores}>
        {(chore) => (
          <TableRow key={chore.id}>
            {/*<TableCell>*/}
            {/*  <Image src={`data:image/png;base64,${chore.image}`} width={36} />*/}
            {/*</TableCell>*/}
            <TableCell>{chore.name}</TableCell>
            <TableCell>
              <Currency value={chore.reward} />
            </TableCell>
            <TableCell>
              <ResourceActions
                key={chore.id}
                form={{
                  ...form,
                  defaultValues: {
                    // image: chore.image,
                    name: chore.name,
                    reward: chore.reward,
                  },
                  resource: {
                    type: form.resource.type,
                    id: chore.id,
                    name: chore.name,
                  },
                  hiddenFields: form.hiddenFields.concat([
                    { name: "choreId", value: chore.id },
                  ]),
                }}
              />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
