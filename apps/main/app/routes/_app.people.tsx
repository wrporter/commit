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
import { createPerson, getPeople } from "#app/lib/repository/person.server.ts";
import { FormInput } from "#app/lib/ui/form-input.tsx";
import { personValidator } from "./_app.home/validators";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const people = await getPeople(user.id);

  return json({ people });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();

  const form = await personValidator.validate(formData);
  invariant(form.data, "No form data");
  await createPerson(user.id, form.data.name, form.data.birthday);

  return null;
};

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <section className="p-4">
      <div className="flex flex-col">
        <h2 className="text-xl">People</h2>

        <Divider className="mt-1 mb-2" />

        <ValidatedForm
          validator={personValidator}
          method="post"
          subaction="createPerson"
          className="space-y-2"
        >
          <FormInput label="Name" name="name" placeholder="Johnny Appleseed" />

          <FormInput
            label="Birthday"
            name="birthday"
            placeholder="MM/DD/YYYY"
          />

          <Button type="submit" color="primary" variant="ghost" fullWidth>
            Create
          </Button>
        </ValidatedForm>
      </div>

      <Divider className="my-4" />

      <div className="flex flex-col gap-4 mt-4">
        {data.people.map((person) => (
          <div key={person.id} className="p-2 border border-gray-300 rounded">
            {person.name}
          </div>
        ))}
      </div>
    </section>
  );
}
