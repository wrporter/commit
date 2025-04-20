import {
  date,
  index,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Remove file extension in order to run `npm run db:generate`
import { bytea } from "./bytea.column-type.js";

export interface PaymentCategory {
  name: string;
  percent: number;
}

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    email: varchar({ length: 40 }).notNull(),
    imageUrl: text(),
    image: bytea(),
    displayName: varchar({ length: 20 }).notNull(),
    socialProviders: jsonb(),
    passwordHash: text(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => {
    return {
      emailIndex: uniqueIndex().on(table.email),
    };
  }
);

export const families = pgTable("families", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: varchar({ length: 20 }).notNull(),
  paymentCategories: jsonb().$type<PaymentCategory[]>(),
  createdAt: timestamp().notNull().defaultNow(),
  createdBy: uuid()
    .notNull()
    .references(() => users.id),
  updatedAt: timestamp().notNull().defaultNow(),
  updatedBy: uuid()
    .notNull()
    .references(() => users.id),
});

export const familyUsers = pgTable(
  "family_users",
  {
    familyId: uuid()
      .notNull()
      .references(() => families.id),
    userId: uuid()
      .notNull()
      .references(() => users.id),
    createdAt: timestamp().notNull().defaultNow(),
    createdBy: uuid()
      .notNull()
      .references(() => users.id),
    updatedAt: timestamp().notNull().defaultNow(),
    updatedBy: uuid()
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    familyUserPrimaryKey: primaryKey({
      columns: [table.familyId, table.userId],
    }),
  })
);

export const people = pgTable(
  "people",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    familyId: uuid()
      .notNull()
      .references(() => families.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: varchar({ length: 20 }).notNull(),
    birthday: date().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    createdBy: uuid()
      .notNull()
      .references(() => users.id),
    updatedAt: timestamp().notNull().defaultNow(),
    updatedBy: uuid()
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    idFamilyIndex: index().on(table.familyId, table.id),
  })
);

export const chores = pgTable(
  "chores",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    familyId: uuid()
      .notNull()
      .references(() => families.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    // image: bytea().notNull(),
    name: varchar({ length: 40 }).notNull(),
    // TODO: Make this just a default reward.
    reward: numeric({ precision: 16, scale: 4 }).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    createdBy: uuid()
      .notNull()
      .references(() => users.id),
    updatedAt: timestamp().notNull().defaultNow(),
    updatedBy: uuid()
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    idFamilyIndex: index().on(table.familyId, table.id),
  })
);

export const choreAssignments = pgTable(
  "chore_assignments",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    familyId: uuid()
      .notNull()
      .references(() => families.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    personId: uuid()
      .notNull()
      .references(() => people.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    choreId: uuid()
      .notNull()
      .references(() => chores.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    dayOfWeek: smallint().notNull(),
    // TODO: Clarify that this is an override reward
    reward: numeric({ precision: 16, scale: 4 }),
    createdAt: timestamp().notNull().defaultNow(),
    createdBy: uuid()
      .notNull()
      .references(() => users.id),
    updatedAt: timestamp().notNull().defaultNow(),
    updatedBy: uuid()
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    personChoreAssignmentDayIndex: uniqueIndex().on(
      table.personId,
      table.choreId,
      table.dayOfWeek
    ),
  })
);

export const commissions = pgTable(
  "commissions",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    familyId: uuid()
      .notNull()
      .references(() => families.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    personId: uuid()
      .notNull()
      .references(() => people.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    // Is NULL for ad-hoc chores.
    choreId: uuid().references(() => chores.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    // Is NULL for defined chores.
    choreName: varchar({ length: 40 }),
    baseAmount: numeric({ precision: 16, scale: 4 }).notNull(),
    rating: smallint().notNull().default(3),
    // Is NULL for bonus chores
    assignmentId: uuid().references(() => choreAssignments.id, {
      onDelete: "restrict",
    }),
    finalAmount: numeric({ precision: 16, scale: 4 }).notNull(),
    balance: numeric({ precision: 16, scale: 4 }).notNull().default("0"),
    date: date().notNull().defaultNow(),
    paidAt: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    familyPersonChoreIndex: uniqueIndex().on(
      table.familyId,
      table.personId,
      table.choreId,
      table.date
    ),
  })
);
