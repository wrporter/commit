import { Checkbox, Link, cn } from "@nextui-org/react";
import { useState } from "react";
import { type LoaderFunctionArgs, Link as RouterLink } from "react-router";
import { tv } from "tailwind-variants";

import type { Route } from "./+types/chore-chart.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { getAssignments } from "~/lib/repository/assignment.server.js";
import { type Chore, getChores } from "~/lib/repository/chore.server.js";
import { DAYS } from "~/lib/repository/DAYS.js";
import { getPeople } from "~/lib/repository/person.server.js";
import { type Reward, getRewards } from "~/lib/repository/reward.server.js";
import { Currency } from "~/lib/ui/currency.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const people = await getPeople(user.id);
  const chores = await getChores(user.id);
  const rewards = await getRewards(user.id);
  const assignments = await getAssignments(user.id);

  return { people, chores, rewards, assignments };
};

export default function Component({ loaderData }: Route.ComponentProps) {
  const today = new Date().toLocaleString("en-us", {
    weekday: "long",
  }) as (typeof DAYS)[number];
  const dayOfWeek = DAYS.indexOf(today);

  const chores = loaderData.chores.reduce((accu, entity) => {
    accu[entity.id] = entity;
    return accu;
  }, {} as { [key: string]: Chore });
  const assignmentsForToday = loaderData.assignments.filter(
    (assignment) => assignment.day === dayOfWeek
  );

  return (
    <div className="p-4">
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {loaderData.people.map((person) => {
          const assignments = assignmentsForToday.filter(
            (assignment) => assignment.personId === person.id
          );

          return (
            <div
              key={person.name}
              className="rounded-md p-4 bg-slate-100 border border-slate-200"
            >
              {/* <div className="rounded-md m-2 p-4 bg-slate-100 border border-slate-200"> */}
              <h3 className="flex justify-center text-lg font-bold border-b border-b-slate-200 pb-2 mb-2">
                {person.name}
              </h3>

              {assignments.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {assignments.map((assignment) => {
                    const chore = chores[assignment.choreId];
                    const reward = loaderData.rewards.find(
                      (reward) =>
                        reward.choreId === assignment.choreId &&
                        reward.personId === assignment.personId
                    );
                    const key = `${assignment.personId}_${assignment.choreId}`;

                    return (
                      <TaskCheckbox key={key} chore={chore} reward={reward} />
                    );
                  })}
                </div>
              ) : (
                <div className="px-6 py-4 w-full rounded text-lg bg-gradient-to-r from-cyan-200 to-blue-200">
                  🎉 No tasks today!
                </div>
              )}
              {/* </div> */}
            </div>
          );
        })}
      </div>

      <Link as={RouterLink} to="/home" className="flex mt-8">
        Take me home
      </Link>
    </div>
  );
}

const taskVariants = tv({
  base: [
    "px-6 py-4 w-full bg-white rounded text-lg",
    "flex justify-between items-center",
    "hover:bg-blue-100",
  ],
  variants: {
    done: {
      true: "line-through opacity-50",
      false: "",
    },
  },
});

function TaskCheckbox({ chore, reward }: { chore: Chore; reward?: Reward }) {
  const [done, setDone] = useState(false);

  return (
    <Checkbox
      classNames={{
        base: cn(
          "flex max-w-full bg-content1 m-0",
          "hover:bg-content2 items-center justify-start",
          "cursor-pointer rounded px-6 py-4",
          "data-[selected=true]:opacity-50 data-[selected=true]:line-through"
        ),
        label: "w-full",
      }}
      isSelected={done}
      onValueChange={setDone}
    >
      <div className="flex justify-between">
        <span>
          {chore.icon} {chore.name}
        </span>
        {reward ? (
          <Currency value={reward.amount} />
        ) : (
          <span className="text-gray-400">No reward</span>
        )}
      </div>
    </Checkbox>
  );
}
