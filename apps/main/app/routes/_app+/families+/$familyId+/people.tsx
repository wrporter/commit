import {
  Button,
  DropdownItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  type ModalProps,
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
import { useEffect, useState } from "react";
import { data, useFetcher, useParams } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/people.js";

import type { PaymentCategory } from "#server/schema/db-schema.server.js";
import { requireUser } from "~/lib/authentication/authentication.server.js";
import { requireFamilyAccess } from "~/lib/authorization/require-family.js";
import { useHints } from "~/lib/client-hints/client-hints.js";
import { getCommissions } from "~/lib/repository/commissions.server.js";
import {
  type Person,
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
  const family = await requireFamilyAccess(user, params.familyId);

  const people = await getPeople(family.id);
  const commissions = await getCommissions(family.id);
  return { family, people, commissions };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);

  if (request.method === "DELETE") {
    const result = await withZod(
      z.object({ personId: z.string().uuid() })
    ).validate(await request.formData());
    if (result.error) {
      return validationError(result.error, result.submittedData);
    }

    const personId = result.data.personId;
    const person = await getPerson(user.id, family.id, personId);
    if (!person) {
      throw data({ errorMessage: `Person [${personId}] does not exist` }, 404);
    }

    return deletePerson(family.id, personId);
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

  const [payModalProps, setPayModalProps] =
    useState<Pick<PayModalProps, "person" | "amountDue" | "onPay">>();

  return (
    <Table
      aria-label="Table of people"
      topContent={
        <div className="flex justify-between items-center">
          <h2 className="text-xl">People</h2>
          <ResourceModal form={form} />

          {payModalProps?.person && (
            <PayModal
              categories={loaderData.family.paymentCategories ?? []}
              {...payModalProps}
              onOpenChange={() => setPayModalProps(undefined)}
              isLoading={payFetcher.state !== "idle"}
            />
          )}
        </div>
      }
      topContentPlacement="outside"
    >
      <TableHeader>
        <TableColumn>Name</TableColumn>
        <TableColumn className="hidden sm:table-cell">Age</TableColumn>
        <TableColumn className="hidden sm:table-cell">Birthday</TableColumn>
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
              <TableCell className="hidden sm:table-cell">
                {getAge(person.birthday)}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {formatDate(person.birthday, locale, timeZone)}
              </TableCell>
              <TableCell>
                <Currency value={amountDue} />
              </TableCell>
              <TableCell>
                <ResourceActions
                  key={person.id}
                  actions={
                    !amountDue.isZero() ? (
                      <DropdownItem
                        key="pay"
                        onPress={() =>
                          setPayModalProps({
                            person,
                            amountDue,
                            onPay: handlePay,
                          })
                        }
                        color="success"
                        className="text-success"
                      >
                        Pay
                      </DropdownItem>
                    ) : undefined
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

interface PayModalProps extends Omit<ModalProps, "children"> {
  person: Person;
  amountDue: Decimal;
  categories: PaymentCategory[];
  onPay: () => void;
  isLoading: boolean;
}

function PayModal({
  person,
  amountDue = new Decimal(0),
  categories,
  onPay,
  isLoading,
  ...rest
}: PayModalProps) {
  const amounts = categories.map(({ name, percent }) => ({
    name,
    percent,
    amountDue: new Decimal(percent)
      .div(100)
      .mul(amountDue)
      .mul(100)
      .floor()
      .div(100),
  }));
  const leftover = amountDue.minus(
    amounts.reduce((accu, { amountDue }) => accu.add(amountDue), new Decimal(0))
  );

  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isLoading && isSubmitted) {
      setIsOpen(false);
    }
  }, [isLoading]);

  return (
    <Modal placement="center" isOpen={isOpen} {...rest}>
      <ModalContent>
        <ModalHeader>Pay {person?.name}</ModalHeader>
        <ModalBody>
          {amounts.length > 0 ? (
            <Table removeWrapper aria-label="Payment categories">
              <TableHeader>
                <TableColumn>Category</TableColumn>
                <TableColumn>Distribution</TableColumn>
                <TableColumn align="end">Amount Due</TableColumn>
              </TableHeader>
              <TableBody>
                <>
                  {amounts.map(({ name, percent, amountDue }, index) => (
                    <TableRow key={`${name}.${index}`}>
                      <TableCell>{name}</TableCell>
                      <TableCell>{percent}%</TableCell>
                      <TableCell>
                        <Currency value={amountDue.toFixed(2)} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!leftover.isZero() && (
                    <TableRow>
                      <TableCell>{""}</TableCell>
                      <TableCell>{""}</TableCell>
                      <TableCell className="border-t-1 border-t-default-200">
                        <div className="flex justify-between gap-2">
                          <div>Leftover</div>
                          <Currency value={leftover} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
                <TableRow className="bg-default-100">
                  <TableCell>{""}</TableCell>
                  <TableCell>{""}</TableCell>
                  <TableCell>
                    <div className="flex justify-between gap-2">
                      <div className="font-bold">TOTAL</div>
                      <Currency value={amountDue} className="font-bold" />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="font-bold">
              Total amount due: <Currency value={amountDue} />
            </div>
          )}

          <div className="text-sm">
            Confirming payment will mark all commissions as paid for{" "}
            {person.name}. Pay the child however you desire -- via physical
            cash, bank transfer, or otherwise -- then confirm payment below.
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            isLoading={isLoading}
            color="primary"
            onPress={() => {
              setIsSubmitted(true);
              onPay();
            }}
          >
            Confirm Payment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
