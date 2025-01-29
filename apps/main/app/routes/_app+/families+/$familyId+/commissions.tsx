import { CheckIcon } from "@heroicons/react/24/outline";
import {
  Card,
  CardBody,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { validationError } from "@rvf/react-router";
import { type LoaderFunctionArgs } from "react-router";

import type { Route } from "./+types/commissions.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { requireFamilyAccess } from "~/lib/authorization/require-family.js";
import { useHints } from "~/lib/client-hints/client-hints.js";
import {
  createCommission,
  deleteCommission,
  getCommissions,
} from "~/lib/repository/commissions.server.js";
import { getPeople } from "~/lib/repository/person.server.js";
import { Currency } from "~/lib/ui/currency.js";
import { formatDate } from "~/lib/ui/date.format.js";
import { commissionValidator } from "~/lib/validators.js";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);

  const [people, commissions] = await Promise.all([
    getPeople(family.id),
    getCommissions(family.id),
  ]);
  return { people, commissions };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);
  const formData = await request.clone().formData();

  const result = await commissionValidator.validate(await request.formData());
  if (result.error) {
    return validationError(result.error, result.submittedData);
  }

  if (result.data.commissionId) {
    return await deleteCommission(family.id, result.data.commissionId);
  }

  if (formData.get("action") === "customChore") {
    await createCommission({
      ...result.data,
      assignmentId: null,
      familyId: params.familyId,
      rating: 3,
      baseAmount: result.data.baseAmount.toFixed(2),
      finalAmount: result.data.baseAmount.toFixed(2),
    });
  } else {
    return await createCommission({
      ...result.data,
      assignmentId: null,
      familyId: params.familyId,
      rating: 3,
      baseAmount: result.data.baseAmount.toFixed(2),
      finalAmount: result.data.baseAmount.toFixed(2),
    });
  }
};

export default function Component({ loaderData }: Route.ComponentProps) {
  const { locale, timeZone } = useHints();

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-lg">Commissions</h2>
      </div>

      <div className="sm:hidden flex flex-col gap-2 mt-4">
        {loaderData.commissions.length === 0 && (
          <div className="flex justify-center items-center text-default-600 h-20 border-1 border-default-300 rounded">
            There are no commissions
          </div>
        )}

        {loaderData.commissions.map((commission) => {
          const isBonus = !commission.assignmentId;
          const isPaid = Boolean(commission?.paidAt);
          const person = loaderData.people.find(
            (person) => person.id === commission.personId
          );

          return (
            <Card key={commission.id} className="w-full">
              <CardBody className="flex gap-1">
                <div className="flex justify-between">
                  <div className="font-bold">{person?.name}</div>
                  <Currency value={commission.finalAmount} />
                </div>

                <div>
                  {isBonus && (
                    <Chip
                      size="sm"
                      color="primary"
                      variant="bordered"
                      className="inline-flex mr-1"
                    >
                      Bonus
                    </Chip>
                  )}
                  {commission.choreName}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-default-500">
                    {formatDate(
                      parseDate(commission.date).toDate(timeZone),
                      locale,
                      timeZone
                    )}
                  </div>

                  <div>
                    {isPaid ? (
                      <Chip
                        size="sm"
                        color="success"
                        variant="bordered"
                        startContent={<CheckIcon width={12} />}
                      >
                        Paid
                      </Chip>
                    ) : (
                      <Chip size="sm" color="warning" variant="dot">
                        Unpaid
                      </Chip>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Table aria-label="Commissions" className="hidden sm:flex mt-4">
        <TableHeader>
          <TableColumn>Person</TableColumn>
          <TableColumn>Reward</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Date</TableColumn>
          <TableColumn>Chore</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="There are no commissions"
          items={loaderData.commissions}
        >
          {(commission) => {
            const isPaid = Boolean(commission?.paidAt);
            const person = loaderData.people.find(
              (person) => person.id === commission.personId
            );

            return (
              <TableRow key={commission.id}>
                <TableCell>{person?.name}</TableCell>
                <TableCell>
                  <Currency value={commission.finalAmount} />
                </TableCell>
                <TableCell className="flex items-center gap-1">
                  {isPaid ? (
                    <Chip
                      size="sm"
                      color="success"
                      variant="bordered"
                      startContent={<CheckIcon width={12} />}
                    >
                      Paid
                    </Chip>
                  ) : (
                    <Chip size="sm" color="warning" variant="dot">
                      Unpaid
                    </Chip>
                  )}
                </TableCell>
                <TableCell>
                  {formatDate(
                    parseDate(commission.date).toDate(timeZone),
                    locale,
                    timeZone
                  )}
                </TableCell>
                <TableCell className="flex gap-1 items-center">
                  {!commission.assignmentId ? (
                    <Chip size="sm" color="primary" variant="bordered">
                      Bonus
                    </Chip>
                  ) : undefined}
                  <div>{commission.choreName}</div>
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </>
  );
}
