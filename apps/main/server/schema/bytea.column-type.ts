import { customType } from "drizzle-orm/pg-core";

export const bytea = customType<{
  data: string;
  notNull: false;
  default: false;
}>({
  dataType() {
    return "bytea";
  },
  toDriver(value) {
    return Buffer.from(value, "base64");
  },
  fromDriver(databaseValue: unknown) {
    // @ts-ignore
    return databaseValue.toString("base64");
  },
});
