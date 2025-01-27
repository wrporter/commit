import { CheckIcon } from "@heroicons/react/24/outline";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  Checkbox,
  Chip,
  DatePicker,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import {
  CalendarDate,
  getDayOfWeek,
  parseDate,
  today,
} from "@internationalized/date";
import { ValidatedForm, validationError } from "@rvf/react-router";
import Decimal from "decimal.js";
import { type ReactNode, useEffect, useState } from "react";
import {
  type LoaderFunctionArgs,
  useFetcher,
  useLoaderData,
  useOutletContext,
  useSearchParams,
} from "react-router";
import { tv } from "tailwind-variants";

import type { Route } from "./+types/chore-chart.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { requireFamilyAccess } from "~/lib/authorization/require-family.js";
import { getHints, useHints } from "~/lib/client-hints/client-hints.js";
import { getAssignments } from "~/lib/repository/assignment.server.js";
import { getChores } from "~/lib/repository/chore.server.js";
import {
  type Commission,
  createCommission,
  deleteCommission,
  getCommissionsForDate,
} from "~/lib/repository/commissions.server.js";
import { DAYS } from "~/lib/repository/DAYS.js";
import { getPeople } from "~/lib/repository/person.server.js";
import { Currency } from "~/lib/ui/currency.js";
import { FormInput } from "~/lib/ui/form-input.js";
import { FormErrors } from "~/lib/ui/resource-actions.js";
import { commissionValidator } from "~/lib/validators.js";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);

  const url = new URL(request.url);
  const searchParamDate = url.searchParams.get("date");
  const date = searchParamDate
    ? parseDate(searchParamDate)
    : today(getHints(request).timeZone);

  const [people, chores, assignments, commissions] = await Promise.all([
    getPeople(family.id),
    getChores(family.id),
    getAssignments(family.id),
    getCommissionsForDate(family.id, date.toString()),
  ]);
  return { people, chores, assignments, commissions };
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
      familyId: params.familyId,
      rating: 3,
      baseAmount: result.data.baseAmount.toFixed(2),
      finalAmount: result.data.baseAmount.toFixed(2),
    });
  } else {
    return await createCommission({
      ...result.data,
      familyId: params.familyId,
      rating: 3,
      baseAmount: result.data.baseAmount.toFixed(2),
      finalAmount: result.data.baseAmount.toFixed(2),
    });
  }
};

const rowVariants = tv({
  base: "hover:bg-default-100 cursor-pointer",
  variants: {
    disabled: {
      true: "opacity-60",
    },
    selected: {
      true: "bg-primary-50",
    },
  },
});

export default function Component({ loaderData }: Route.ComponentProps) {
  const { locale, timeZone } = useHints();
  const { header } = useOutletContext<{ header: ReactNode }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParamDate = searchParams.get("date");
  const date = searchParamDate ? parseDate(searchParamDate) : today(timeZone);
  const dayOfWeek = getDayOfWeek(date, locale, "mon");

  const assignmentsForToday = loaderData.assignments.filter(
    (assignment) => assignment.dayOfWeek === dayOfWeek
  );
  const customChores = loaderData.commissions
    .filter(
      (commission) =>
        !assignmentsForToday.some(
          (assignment) => commission.choreId === assignment.choreId
        )
    )
    .map((commission) => ({
      ...commission,
      choreReward: commission.finalAmount,
    }));

  const chores = [
    ...assignmentsForToday.map((assignment) => ({
      type: "assignment",
      ...assignment,
    })),
    ...customChores.map((customChore) => ({
      type: "commission",
      ...customChore,
    })),
  ];

  const fetcher = useFetcher();
  const handleSelect = (
    assignment: (typeof chores)[0],
    date: CalendarDate,
    commission?: Commission
  ) => {
    const data: Record<string, string> = {
      personId: assignment.personId,
      ...(assignment.choreId && { choreId: assignment.choreId }),
      ...(assignment.choreName && { choreName: assignment.choreName }),
      date: date.toString(),
      baseAmount: assignment.choreReward,
    };

    if (commission) {
      data.commissionId = commission.id;

      // Do not allow already paid chores/commissions to be deselected.
      if (new Decimal(commission?.balance).isZero()) {
        return;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetcher.submit(data, { method: "post" });
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {header}
          <div className="text-lg">{DAYS[dayOfWeek]}</div>
        </div>

        <DatePicker
          className="max-w-40"
          size="sm"
          labelPlacement="outside-left"
          label="Date"
          // @ts-ignore
          value={date}
          // @ts-ignore
          onChange={(date) => setSearchParams({ date })}
          CalendarBottomContent={
            <div className="flex p-1 justify-center items-center">
              <Button
                size="sm"
                color="primary"
                variant="light"
                onPress={() =>
                  setSearchParams({ date: today(timeZone).toString() })
                }
              >
                Today
              </Button>
            </div>
          }
        />
      </div>

      <div className="sm:hidden flex flex-col gap-2 mt-4">
        {chores.length === 0 && (
          <div className="flex justify-center items-center text-default-600 h-20 border-1 border-default-300 rounded">
            No chores today
          </div>
        )}

        {chores.map((assignment) => {
          const commission = loaderData.commissions.find(
            ({ personId, choreId }) =>
              assignment.personId === personId && assignment.choreId === choreId
          );

          const isCompleted = Boolean(commission);
          const isPaid = Boolean(commission?.paidAt);

          return (
            <Card
              key={assignment.id}
              className="w-full"
              isHoverable={!isPaid}
              isPressable={!isPaid}
              isDisabled={isPaid}
              onPress={() => handleSelect(assignment, date, commission)}
            >
              <CardBody className="flex gap-2">
                <div className="flex justify-between">
                  <div className="flex">
                    <Checkbox
                      isSelected={isCompleted}
                      onValueChange={() =>
                        handleSelect(assignment, date, commission)
                      }
                    />
                    <div className="font-bold">{assignment.personName}</div>
                  </div>
                  <div>{assignment.choreName}</div>
                </div>

                <div className="flex justify-between">
                  <div className="flex gap-2">
                    {isPaid && (
                      <Chip
                        size="sm"
                        color="success"
                        variant="bordered"
                        startContent={<CheckIcon width={12} />}
                      >
                        Paid
                      </Chip>
                    )}

                    {assignment.type === "commission" && (
                      <Chip size="sm" color="primary" variant="bordered">
                        Bonus
                      </Chip>
                    )}
                  </div>

                  <div>
                    <Currency value={assignment.choreReward} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Table aria-label="Chore chart for today" className="hidden sm:flex mt-4">
        <TableHeader>
          <TableColumn>Status</TableColumn>
          <TableColumn>Person</TableColumn>
          <TableColumn>Chore</TableColumn>
          <TableColumn>Reward</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No chores today" items={chores}>
          {(assignment) => {
            const commission = loaderData.commissions.find(
              ({ personId, choreId }) =>
                assignment.personId === personId &&
                assignment.choreId === choreId
            );

            const isCompleted = Boolean(commission);
            const isPaid = Boolean(commission?.paidAt);

            return (
              <TableRow
                key={assignment.id}
                onClick={() => handleSelect(assignment, date, commission)}
                className={rowVariants({
                  disabled: isPaid,
                  selected: isCompleted,
                })}
              >
                <TableCell className="flex items-center gap-1">
                  <Checkbox
                    isSelected={isCompleted}
                    onValueChange={() =>
                      handleSelect(assignment, date, commission)
                    }
                  />
                  {assignment.type === "commission" && (
                    <Chip size="sm" color="primary" variant="bordered">
                      Bonus
                    </Chip>
                  )}
                  {isPaid && (
                    <Chip
                      size="sm"
                      color="success"
                      variant="bordered"
                      startContent={<CheckIcon width={12} />}
                    >
                      Paid
                    </Chip>
                  )}
                </TableCell>
                <TableCell>{assignment.personName}</TableCell>
                <TableCell>{assignment.choreName}</TableCell>
                <TableCell>
                  <Currency value={assignment.choreReward} />
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>

      <CustomChoreCommission date={date} />
    </>
  );
}

function CustomChoreCommission({ date }: { date: CalendarDate }) {
  const loaderData = useLoaderData<Route.ComponentProps["loaderData"]>();
  const [personId, setPersonId] = useState("");
  const [choreId, setChoreId] = useState("");
  const [reward, setReward] = useState("");

  useEffect(() => {
    const chore = loaderData.chores.find((chore) => chore.id === choreId);
    if (chore) {
      setReward(new Decimal(chore.reward).toFixed(2));
    }
  }, [choreId]);

  return (
    <ValidatedForm
      method="post"
      validator={commissionValidator}
      className="mt-4"
    >
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <input type="hidden" name="action" value="customChore" />
        <input type="hidden" name="personId" value={personId} />
        <input type="hidden" name="choreId" value={choreId} />
        <input type="hidden" name="date" value={date.toString()} />

        <Autocomplete
          name="personName"
          label="Person"
          defaultItems={loaderData.people}
          onSelectionChange={(key) => setPersonId(key?.toString() ?? "")}
        >
          {(person) => (
            <AutocompleteItem key={person.id}>{person.name}</AutocompleteItem>
          )}
        </Autocomplete>

        <Autocomplete
          name="choreName"
          label="Chore"
          defaultItems={loaderData.chores}
          allowsCustomValue
          onSelectionChange={(key) => setChoreId(key?.toString() ?? "")}
        >
          {(chore) => (
            <AutocompleteItem key={chore.id}>{chore.name}</AutocompleteItem>
          )}
        </Autocomplete>

        <FormInput
          type="number"
          key="reward"
          name="baseAmount"
          label="Reward"
          placeholder="1.50"
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-500 text-small">$</span>
            </div>
          }
          value={reward}
          onChange={(event) => setReward(event.target.value)}
        />

        <Button type="submit" color="primary" variant="bordered">
          Add
        </Button>
      </div>

      <FormErrors />
    </ValidatedForm>
  );
}
