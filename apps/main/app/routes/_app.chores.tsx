import { Button, Divider } from "@nextui-org/react";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";

import { useLoaderData } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import invariant from "tiny-invariant";
import { requireUser } from "#app/auth.server.ts";
import { FormInput } from "#app/lib/ui/form-input.tsx";
import { choreValidator, personValidator } from "./_app.home/validators";
import { createChore, getChores } from "#app/lib/repository/chore.server.ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const chores = await getChores(user.id);

  return json({ chores });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();

  const form = await choreValidator.validate(formData);
  invariant(form.data, "No form data");
  await createChore(user.id, form.data);

  return null;
};

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <section className="p-4">
      <div className="flex flex-col">
        <h2 className="text-xl">Chores</h2>

        <Divider className="mt-1 mb-2" />

        <ValidatedForm
          validator={choreValidator}
          method="post"
          subaction="createChore"
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
        {data.chores.map((chore) => (
          <div key={chore.id} className="p-2 border border-gray-300 rounded">
            {chore.icon} {chore.name}
          </div>
        ))}
      </div>
    </section>
  );
}
