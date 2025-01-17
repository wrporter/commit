import { Button, Divider } from "@nextui-org/react";
import { ValidatedForm } from "@rvf/react-router";
import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import invariant from "tiny-invariant";

import type { Route } from "./+types/_app.chores.js";
import { choreValidator } from "./_app.home/validators.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { createChore, getChores } from "~/lib/repository/chore.server.js";
import { FormInput } from "~/lib/ui/form-input.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const chores = await getChores(user.id);

  return { chores };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();

  const form = await choreValidator.validate(formData);
  invariant(form.data, "No form data");
  await createChore(user.id, form.data);

  return null;
};

export default function Component({ loaderData }: Route.ComponentProps) {
  return (
    <section className="p-4">
      <div className="flex flex-col">
        <h2 className="text-xl">Chores</h2>

        <Divider className="mt-1 mb-2" />

        <ValidatedForm
          validator={choreValidator}
          method="post"
          className="space-y-2"
        >
          <FormInput
            label="Icon"
            name="icon"
            placeholder="Icon"
            maxLength={2}
            isRequired
          />

          <FormInput label="Name" name="name" placeholder="Vacuum" isRequired />

          <Button type="submit" color="primary" variant="ghost" fullWidth>
            Create
          </Button>
        </ValidatedForm>
      </div>

      <Divider className="my-4" />

      <div className="flex flex-col gap-4 mt-4">
        {loaderData.chores.map((chore) => (
          <div key={chore.id} className="p-2 border border-gray-300 rounded">
            {chore.icon} {chore.name}
          </div>
        ))}
      </div>
    </section>
  );
}
