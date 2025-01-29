import { withZod } from "@rvf/zod";
import Decimal from "decimal.js";
import { z } from "zod";
import { zfd } from "zod-form-data";

const DecimalSchema = z
  .string({ required_error: "Please enter a valid decimal value." })
  .refine(
    (value) => {
      try {
        new Decimal(value);
        return true;
      } catch (error) {
        return false;
      }
    },
    { message: "Please enter a valid decimal value." }
  )
  .transform((value) => new Decimal(value));

export const familyValidator = withZod(
  z.object({
    familyId: z.string().optional(),
    name: z.string().min(1, "Please enter a name.").max(20),
  })
);

export const personValidator = withZod(
  z.object({
    personId: z.string().optional(),
    name: z.string().min(1, "Please enter a name.").max(20),
    birthday: z.string().min(10, "Please enter a birthday.").max(10),
  })
);

export const choreValidator = withZod(
  z.object({
    choreId: z.string().optional(),
    // image: z
    //   .string({ required_error: "Please upload an image." })
    //   .min(1, "Please upload an image."),
    name: z.string().min(1, "Please enter a name."),
    reward: DecimalSchema,
  })
);

export const assignmentValidator = withZod(
  z.object({
    assignmentId: z.string().optional(),
    dayOfWeek: zfd.numeric(
      z.number({ required_error: "Please select a day of the week." })
    ),
    personId: z.string({ required_error: "Please select a person." }),
    choreId: z.string({ required_error: "Please select a chore." }),
  })
);

export const commissionValidator = withZod(
  z.object({
    // TODO: Allow deleting and editing if there was a mistake for custom chores
    commissionId: z.string().optional(),
    assignmentId: z.string().optional(),
    personId: z.string({ required_error: "Please select a person." }),
    choreId: z
      .string()
      .optional()
      .transform((value) => (value ? value : null)),
    choreName: z
      .string({ required_error: "Please enter a chore name." })
      .min(1, "Please enter a chore name.")
      .max(40, "Please use no more than 40 characters."),
    date: z.string({ required_error: "Please enter a date." }),
    baseAmount: DecimalSchema,
  })
);
