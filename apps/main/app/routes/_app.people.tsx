import { Button, Divider } from "@nextui-org/react";
import { ValidatedForm } from "@rvf/react-router";
import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import invariant from "tiny-invariant";

import type { Route } from "./+types/_app.people.js";
import { personValidator } from "./_app.home/validators.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { createPerson, getPeople } from "~/lib/repository/person.server.js";
import { FormInput } from "~/lib/ui/form-input.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const people = await getPeople(user.id);

  return { people };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();

  const form = await personValidator.validate(formData);
  invariant(form.data, "No form data");
  await createPerson(user.id, form.data.name, form.data.birthday);

  return null;
};

export default function Component({ loaderData }: Route.ComponentProps) {
  return (
    <section className="p-4">
      <div className="flex flex-col">
        <h2 className="text-xl">People</h2>

        <Divider className="mt-1 mb-2" />

        <ValidatedForm
          validator={personValidator}
          method="post"
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
        {loaderData.people.map((person) => (
          <div key={person.id} className="p-2 border border-gray-300 rounded">
            {person.name}
          </div>
        ))}
      </div>
    </section>
  );
}
