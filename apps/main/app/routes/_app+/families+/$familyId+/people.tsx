import {
  DropdownItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { validationError } from "@rvf/react-router";
import { withZod } from "@rvf/zod";
import Decimal from "decimal.js";
import { data, useFetcher, useParams } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/people.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { useHints } from "~/lib/client-hints/client-hints.js";
import { getCommissions } from "~/lib/repository/commissions.server.js";
import { getFamily } from "~/lib/repository/family.server.js";
import {
  createPerson,
  deletePerson,
  getPeople,
  getPerson,
  updatePerson,
} from "~/lib/repository/person.server.js";
import { Currency } from "~/lib/ui/currency.js";
import { formatDate, getAge, toCalendarDate } from "~/lib/ui/date.format.js";
import { FormDatePicker, FormInput } from "~/lib/ui/form-input.js";
import {
  ResourceActions,
  type ResourceFormPropagatedProps,
  ResourceModal,
} from "~/lib/ui/resource-actions.js";
import { personValidator } from "~/lib/validators.js";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const user = await requireUser(request);
  const familyId = params.familyId;

  if (!familyId) {
    return data(
      { errorMessage: `Family does not exist`, people: [], commissions: [] },
      404
    );
  }
  const family = await getFamily(user.id, familyId);
  if (!family) {
    return data(
      {
        errorMessage: `Family [${familyId}] does not exist`,
        people: [],
        commissions: [],
      },
      404
    );
  }

  const people = await getPeople(user.id, familyId);
  const commissions = await getCommissions(familyId);
  return { people, commissions };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireUser(request);
  const familyId = params.familyId;

  if (!familyId) {
    return data({ errorMessage: `Family does not exist` }, 404);
  }
  const family = await getFamily(user.id, familyId);
  if (!family) {
    return data({ errorMessage: `Family [${familyId}] does not exist` }, 404);
  }

  if (request.method === "DELETE") {
    const result = await withZod(
      z.object({ personId: z.string().uuid() })
    ).validate(await request.formData());
    if (result.error) {
      return validationError(result.error, result.submittedData);
    }

    const personId = result.data.personId;
    const person = await getPerson(user.id, familyId, personId);
    if (!person) {
      return data({ errorMessage: `Person [${personId}] does not exist` }, 404);
    }

    return deletePerson(familyId, personId);
  }

  const result = await personValidator.validate(await request.formData());
  if (result.error) {
    return validationError(result.error, result.submittedData);
  }

  if (request.method === "POST") {
    return await createPerson({
      ...result.data,
      createdBy: user.id,
      familyId: params.familyId,
    });
  }

  if (request.method === "PUT" && result.data.personId) {
    return await updatePerson({
      ...result.data,
      id: result.data.personId,
      updatedBy: user.id,
    });
  }
};

export default function Component({ loaderData }: Route.ComponentProps) {
  const form: ResourceFormPropagatedProps = {
    validator: personValidator,
    fields: [
      <FormInput
        key="name"
        name="name"
        label="Name"
        placeholder="Amy"
        type="text"
      />,
      <FormDatePicker key="birthday" name="birthday" label="Birthday" />,
    ],
    hiddenFields: [],
    resource: { type: "Person" },
  };
  const { locale, timeZone } = useHints();
  const payFetcher = useFetcher();
  const { familyId } = useParams();

  return (
    <Table
      aria-label="Table of people"
      isHeaderSticky
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      topContent={
        <div className="flex justify-end">
          <ResourceModal form={form} />
        </div>
      }
      topContentPlacement="outside"
    >
      <TableHeader>
        <TableColumn>Name</TableColumn>
        <TableColumn>Age</TableColumn>
        <TableColumn>Birthday</TableColumn>
        <TableColumn>Amount Due</TableColumn>
        <TableColumn align="end">Actions</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No people found" items={loaderData.people}>
        {(person) => {
          const commissions = loaderData.commissions.filter(
            ({ personId }) => personId === person.id
          );
          const amountDue = commissions.reduce((accu, commission) => {
            return accu.add(new Decimal(commission.balance));
          }, new Decimal(0));

          const handlePay = () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            payFetcher.submit(
              { personId: person.id },
              {
                method: "post",
                action: `/api/families/${familyId}/people/${person.id}/pay`,
              }
            );
          };

          return (
            <TableRow key={person.id}>
              <TableCell>{person.name}</TableCell>
              <TableCell>{getAge(person.birthday)}</TableCell>
              <TableCell>
                {formatDate(person.birthday, locale, timeZone)}
              </TableCell>
              <TableCell>
                <Currency value={amountDue} />
              </TableCell>
              <TableCell>
                <ResourceActions
                  key={person.id}
                  actions={
                    <DropdownItem
                      key="pay"
                      onPress={handlePay}
                      color="success"
                      className="text-success"
                    >
                      Pay
                    </DropdownItem>
                  }
                  form={{
                    ...form,
                    defaultValues: {
                      name: person.name,
                      birthday: toCalendarDate(person.birthday),
                    },
                    resource: {
                      type: form.resource.type,
                      id: person.id,
                      name: person.name,
                    },
                    hiddenFields: form.hiddenFields.concat([
                      { name: "personId", value: person.id },
                    ]),
                  }}
                />
              </TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}
