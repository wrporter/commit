import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { validationError } from "@rvf/react-router";
import { withZod } from "@rvf/zod";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
} from "react-router";
import { z } from "zod";

import type { Route } from "./+types/index.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { useHints } from "~/lib/client-hints/client-hints.js";
import {
  createFamily,
  deleteFamily,
  getFamilies,
  getFamily,
  updateFamily,
} from "~/lib/repository/family.server.js";
import { formatDateTime } from "~/lib/ui/date.format.js";
import { FormInput } from "~/lib/ui/form-input.js";
import {
  ResourceActions,
  type ResourceFormPropagatedProps,
  ResourceModal,
} from "~/lib/ui/resource-actions.js";
import { familyValidator } from "~/lib/validators.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const families = await getFamilies(user.id);
  return { families };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);

  if (request.method === "DELETE") {
    const result = await withZod(
      z.object({ familyId: z.string().uuid() })
    ).validate(await request.formData());
    if (result.error) {
      return validationError(result.error, result.submittedData);
    }

    const familyId = result.data.familyId;
    const family = await getFamily(familyId, user.id);
    if (!family) {
      return data({ errorMessage: `Family [${familyId}] does not exist` }, 404);
    }

    return deleteFamily(familyId);
  }

  const result = await familyValidator.validate(await request.formData());
  if (result.error) {
    return validationError(result.error, result.submittedData);
  }

  if (request.method === "POST") {
    return await createFamily({ name: result.data.name, createdBy: user.id });
  }

  if (request.method === "PUT" && result.data.familyId) {
    return await updateFamily({
      id: result.data.familyId,
      name: result.data.name,
      updatedBy: user.id,
    });
  }
};

export default function Component({ loaderData }: Route.ComponentProps) {
  const form: ResourceFormPropagatedProps = {
    validator: familyValidator,
    fields: [
      <FormInput
        key="name"
        name="name"
        label="Name"
        placeholder="Sanchez Family"
        type="text"
      />,
    ],
    hiddenFields: [],
    resource: { type: "Family" },
  };
  const { locale, timeZone } = useHints();

  return (
    <section className="p-4">
      <Table
        aria-label="Table of families"
        isHeaderSticky
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[382px]",
        }}
        topContent={
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Families</h2>
            <ResourceModal form={form} />
          </div>
        }
        topContentPlacement="outside"
      >
        <TableHeader>
          <TableColumn>Name</TableColumn>
          <TableColumn>Last Updated</TableColumn>
          <TableColumn align="end">Actions</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No families found" items={loaderData.families}>
          {(family) => (
            <TableRow key={family.id}>
              <TableCell>
                <Link href={`/families/${family.id}/people`} size="sm">
                  {family.name}
                </Link>
              </TableCell>
              <TableCell>
                {formatDateTime(family.updatedAt, locale, timeZone)}
              </TableCell>
              <TableCell>
                <ResourceActions
                  key={family.id}
                  to={`/families/${family.id}/people`}
                  form={{
                    ...form,
                    defaultValues: {
                      name: family.name,
                    },
                    resource: {
                      type: form.resource.type,
                      id: family.id,
                      name: family.name,
                    },
                    hiddenFields: form.hiddenFields.concat([
                      { name: "familyId", value: family.id },
                    ]),
                  }}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
