import { CheckIcon } from "@heroicons/react/24/outline";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Checkbox,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { ValidatedForm, validationError } from "@rvf/react-router";
import Decimal from "decimal.js";
import { useEffect, useState } from "react";
import {
  type LoaderFunctionArgs,
  data,
  useFetcher,
  useLoaderData,
} from "react-router";
import { tv } from "tailwind-variants";

import type { Route } from "./+types/chore-chart.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { useHints } from "~/lib/client-hints/client-hints.js";
import { getAssignments } from "~/lib/repository/assignment.server.js";
import { getChores } from "~/lib/repository/chore.server.js";
import {
  type Commission,
  createCommission,
  deleteCommission,
  getCommissionsForDate,
} from "~/lib/repository/commissions.server.js";
import { DAYS } from "~/lib/repository/DAYS.js";
import { getFamily } from "~/lib/repository/family.server.js";
import { getPeople } from "~/lib/repository/person.server.js";
import { Currency } from "~/lib/ui/currency.js";
import { toCalendarDate } from "~/lib/ui/date.format.js";
import { FormInput } from "~/lib/ui/form-input.js";
import { FormErrors } from "~/lib/ui/resource-actions.js";
import { commissionValidator } from "~/lib/validators.js";

const defaultValues = {
  assignments: [],
  people: [],
  chores: [],
  commissions: [],
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const familyId = params.familyId;

  if (!familyId) {
    return data(
      { errorMessage: `Family does not exist`, ...defaultValues },
      404
    );
  }

  const family = await getFamily(user.id, familyId);
  if (!family) {
    return data(
      { errorMessage: `Family [${familyId}] does not exist`, ...defaultValues },
      404
    );
  }

  const [people, chores, assignments, commissions] = await Promise.all([
    getPeople(user.id, familyId),
    getChores(familyId),
    getAssignments(familyId),
    getCommissionsForDate(
      familyId,
      toCalendarDate(new Date().toString()).toString()
    ),
  ]);
  return { people, chores, assignments, commissions };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireUser(request);
  const familyId = params.familyId;
  const formData = await request.clone().formData();

  if (!familyId) {
    return data({ errorMessage: `Family does not exist` }, 404);
  }
  const family = await getFamily(user.id, familyId);
  if (!family) {
    return data({ errorMessage: `Family [${familyId}] does not exist` }, 404);
  }

  const result = await commissionValidator.validate(await request.formData());
  if (result.error) {
    return validationError(result.error, result.submittedData);
  }

  if (result.data.commissionId) {
    return await deleteCommission(familyId, result.data.commissionId);
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
  const { locale } = useHints();
  const today = new Date().toLocaleString(locale, {
    weekday: "long",
  }) as (typeof DAYS)[number];
  const dayOfWeek = DAYS.indexOf(today);

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
  const handleSelect =
    (assignment: (typeof chores)[0], commission?: Commission) => () => {
      const data: Record<string, string> = {
        personId: assignment.personId,
        ...(assignment.choreId && { choreId: assignment.choreId }),
        ...(assignment.choreName && { choreName: assignment.choreName }),
        date: toCalendarDate(new Date().toString()).toString(),
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
    <Table
      aria-label="Chore chart for today"
      bottomContentPlacement="outside"
      bottomContent={<CustomChoreCommission />}
    >
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
              assignment.personId === personId && assignment.choreId === choreId
          );

          const isSelected = Boolean(commission);
          const isPaid = Boolean(commission?.paidAt);

          return (
            <TableRow
              key={assignment.id}
              onClick={handleSelect(assignment, commission)}
              className={rowVariants({
                disabled: isPaid,
                selected: isSelected,
              })}
            >
              <TableCell className="flex items-center gap-1">
                <Checkbox
                  isSelected={isSelected}
                  onValueChange={handleSelect(assignment, commission)}
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
  );
}

function CustomChoreCommission() {
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
    <ValidatedForm method="post" validator={commissionValidator}>
      <div className="flex gap-2 items-center">
        <input type="hidden" name="action" value="customChore" />
        <input type="hidden" name="personId" value={personId} />
        <input type="hidden" name="choreId" value={choreId} />

        {/* TODO: Support adjustments in the past. */}
        <input
          type="hidden"
          name="date"
          value={toCalendarDate(new Date().toString()).toString()}
        />

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
