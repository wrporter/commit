import { Tab, Tabs } from "@heroui/react";
import {
  type LoaderFunctionArgs,
  Outlet,
  data,
  useLocation,
  useParams,
} from "react-router";

import type { Route } from "./+types/_layout.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { type Family, getFamily } from "~/lib/repository/family.server.js";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  if (!params.familyId) {
    return data(
      { errorMessage: `Family does not exist`, family: {} as Family },
      404
    );
  }
  const family = await getFamily(user.id, params.familyId);
  return { family };
};

export default function Component({ loaderData }: Route.ComponentProps) {
  const { pathname } = useLocation();
  const params = useParams();
  const base = `/families/${params.familyId}`;

  return (
    <section className="p-4">
      <h2 className="text-xl mb-2">{loaderData.family.name}</h2>

      <Tabs selectedKey={pathname} aria-label="Tabs" className="mb-4">
        <Tab key={`${base}/people`} href={`${base}/people`} title="People" />
        <Tab key={`${base}/chores`} href={`${base}/chores`} title="Chores" />
        <Tab
          key={`${base}/assignments`}
          href={`${base}/assignments`}
          title="Assignments"
        />
        <Tab
          key={`${base}/chore-chart`}
          href={`${base}/chore-chart`}
          title="Chore Chart"
        />
      </Tabs>

      <Outlet />
    </section>
  );
}
