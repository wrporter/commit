import { Button, Link } from "@heroui/react";
import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";

import type { Route } from "./+types/home.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireUser(request);
  return null;
};

export default function Component({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col p-4 gap-4">
      <h1>
        🚧 This page is under construction. Expect to see great things in the
        future!
      </h1>
      <p>
        In the meantime, go ahead and create a family and your first chore
        chart!
      </p>
      <div className="flex p-4 justify-center">
        <Button as={Link} href="/families" color="primary" variant="ghost">
          Manage Families
        </Button>
      </div>
    </div>
  );
}
