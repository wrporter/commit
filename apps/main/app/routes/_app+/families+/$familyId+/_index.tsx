import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, Divider, Input } from "@heroui/react";
import { Form } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/_index.js";

import { requireUser } from "~/lib/authentication/authentication.server.js";
import { requireFamilyAccess } from "~/lib/authorization/require-family.js";
import { updatePaymentCategories } from "~/lib/repository/family.server.js";
import { ConformErrors } from "~/lib/ui/resource-actions.js";

const schema = z
  .object({
    categories: z
      .array(
        z.object({
          name: z
            .string({ required_error: "Please enter a name." })
            .min(1, "Please enter a name."),
          percent: z
            .number({ required_error: "Please enter a percent." })
            .min(1, "Please enter a percent between 1 and 100.")
            .max(100),
        })
      )
      .max(5, "Please provide at most 5 categories."),
  })
  .refine(
    (value) =>
      value.categories.reduce((accu, { percent }) => accu + percent, 0) === 100,
    { message: "Please ensure that category percents total 100." }
  );

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);
  return { family };
};

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireUser(request);
  const family = await requireFamilyAccess(user, params.familyId);

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await updatePaymentCategories({
    id: family.id,
    updatedBy: user.id,
    paymentCategories: submission.value.categories,
  });
}

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [form, fields] = useForm({
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: { categories: loaderData.family.paymentCategories },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    constraint: getZodConstraint(schema),
  });

  const categories = fields.categories.getFieldList();

  return (
    <div>
      <h2 className="text-xl">Family: {loaderData.family.name}</h2>
      <Divider className="mt-1 mb-4" />
      <h3 className="text-lg">Payment Categories</h3>

      <FormProvider context={form.context}>
        <Form
          method="post"
          className="mt-4 flex flex-col gap-2"
          {...getFormProps(form)}
        >
          {categories.map((category, index) => {
            const { name, percent } = category.getFieldset();
            const { key: _ignore1, ...nameProps } = getInputProps(name, {
              type: "text",
            });
            const { key: _ignore2, ...percentProps } = getInputProps(percent, {
              type: "number",
            });

            return (
              <div key={category.key} className="flex items-center gap-1">
                <Input
                  {...nameProps}
                  isInvalid={Boolean(name.errors)}
                  errorMessage={name.errors?.[0]}
                  label="Category"
                  required
                  isRequired
                  minLength={1}
                  maxLength={30}
                />
                <Input
                  {...percentProps}
                  isInvalid={Boolean(percent.errors)}
                  errorMessage={percent.errors?.[0]}
                  label="Percent"
                  required
                  isRequired
                  min={0}
                  max={100}
                />

                {/* Add one below */}
                {/*<Button*/}
                {/*  isIconOnly*/}
                {/*  color="primary"*/}
                {/*  variant="light"*/}
                {/*  isDisabled={categories.length >= 5}*/}
                {/*  onPress={() =>*/}
                {/*    form.insert({*/}
                {/*      name: fields.categories.name,*/}
                {/*      index: index + 1,*/}
                {/*    })*/}
                {/*  }*/}
                {/*  {...form.insert.getButtonProps({*/}
                {/*    name: fields.categories.name,*/}
                {/*    index: index + 1,*/}
                {/*  })}*/}
                {/*>*/}
                {/*  <PlusIcon className="size-4" />*/}
                {/*</Button>*/}
                <Button
                  isIconOnly
                  color="danger"
                  variant="light"
                  onPress={() =>
                    form.remove({ name: fields.categories.name, index })
                  }
                  {...form.remove.getButtonProps({
                    name: fields.categories.name,
                    index,
                  })}
                >
                  <TrashIcon className="size-4" />
                </Button>
              </div>
            );
          })}

          <div className="flex justify-between">
            <Button type="submit" color="primary" variant="ghost">
              Save
            </Button>

            {categories.length < 5 && (
              <Button
                color="primary"
                variant="light"
                startContent={<PlusIcon className="size-4" />}
                onPress={() =>
                  form.insert({
                    name: fields.categories.name,
                  })
                }
                {...form.insert.getButtonProps({
                  name: fields.categories.name,
                })}
              >
                Add Category
              </Button>
            )}
          </div>

          <ConformErrors />
        </Form>
      </FormProvider>
    </div>
  );
}
