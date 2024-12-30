import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { zfd } from "zod-form-data";

export const personValidator = withZod(
  z.object({
    personId: z.string().optional(),
    name: z.string().min(1, "Please enter a name.").max(50),
    birthday: z.string().min(10, "Please enter a birthday.").max(10),
  })
);

export const choreValidator = withZod(
  z.object({
    choreId: z.string().optional(),
    icon: z
      .string()
      .min(1, "Please select an icon.")
      .max(2, "Please use only 1 icon."),
    name: z.string().min(1, "Please enter a name."),
  })
);

export const rewardValidator = withZod(
  z.object({
    personId: z.string(),
    choreId: z.string(),
    amount: zfd.numeric(
      z
        .number({ required_error: "Please enter an amount." })
        .min(0, "Please enter a value greater than 0.")
        .max(100, "Please enter a value less than or equal to 100.")
    ),
  })
);

export const assignmentValidator = withZod(
  z.object({
    day: zfd.numeric(z.number()),
    personId: z.string(),
    choreId: z.string(),
  })
);
