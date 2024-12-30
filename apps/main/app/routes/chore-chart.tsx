import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { TextLink } from "@wesp-up/ui";
import { useState } from "react";
import { tv } from "tailwind-variants";

import { requireUser } from "#app/auth.server.ts";
import { DAYS } from "#app/lib/models/DAYS.ts";
import { type Serialized } from "#app/lib/models/model.ts";
import { getAssignments } from "#app/lib/repository/assignment.server.ts";
import { type Chore, getChores } from "#app/lib/repository/chore.server.ts";
import { getPeople } from "#app/lib/repository/person.server.ts";
import { getRewards, type Reward } from "#app/lib/repository/reward.server.ts";
import { Currency } from "#app/lib/ui/currency.tsx";
import { Checkbox, cn } from "@nextui-org/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const people = await getPeople(user.id);
  const chores = await getChores(user.id);
  const rewards = await getRewards(user.id);
  const assignments = await getAssignments(user.id);

  return json({ people, chores, rewards, assignments });
};

export default function Page() {
  const data = useLoaderData<typeof loader>();
  const today = new Date().toLocaleString("en-us", {
    weekday: "long",
  }) as (typeof DAYS)[number];
  const dayOfWeek = DAYS.indexOf(today);

  const chores = data.chores.reduce((accu, entity) => {
    accu[entity.id] = entity;
    return accu;
  }, {} as { [key: string]: Serialized<Chore> });
  const assignmentsForToday = data.assignments.filter(
    (assignment) => assignment.day === dayOfWeek
  );

  return (
    <div className="p-4">
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {data.people.map((person) => {
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
                    const chore = chores[
                      assignment.choreId
                    ] as Serialized<Chore>;
                    const reward = data.rewards.find(
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

      <TextLink as={Link} to="/home" className="flex mt-8">
        Take me home
      </TextLink>
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

function TaskCheckbox({
  chore,
  reward,
}: {
  chore: Serialized<Chore>;
  reward?: Serialized<Reward>;
}) {
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
