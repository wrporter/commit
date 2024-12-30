import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  integer,
  doublePrecision,
  jsonb,
  primaryKey,
  date,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    email: varchar("email", { length: 40 }).notNull(),
    imageUrl: text("image_url"),
    image: text("image"),
    displayName: varchar("display_name", { length: 20 }).notNull(),
    socialProviders: jsonb("social_providers"),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      email_key: uniqueIndex("email_key").on(table.email),
    };
  }
);

export const people = pgTable("people", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: text("name").notNull(),
  birthday: date("birthday").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().defaultNow(),
});

export const chores = pgTable("chores", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  icon: text("icon").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().defaultNow(),
});

export const rewards = pgTable(
  "chore_rewards",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    choreId: uuid("chore_id")
      .notNull()
      .references(() => chores.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    amount: doublePrecision("amount").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      chore_rewards_pkey: primaryKey({
        columns: [table.personId, table.choreId],
        name: "chore_rewards_pkey",
      }),
    };
  }
);

export const assignments = pgTable(
  "chore_assignments",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    choreId: uuid("chore_id")
      .notNull()
      .references(() => chores.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    day: integer("day").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      chore_assignment_pkey: primaryKey({
        columns: [table.personId, table.choreId, table.day],
        name: "chore_assignment_pkey",
      }),
    };
  }
);

export const choreStatuses = pgTable(
  "chore_statuses",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    choreId: uuid("chore_id")
      .notNull()
      .references(() => chores.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    day: date("day").notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      chore_statuses_pkey: primaryKey({
        columns: [table.personId, table.choreId, table.day],
        name: "chore_statuses_pkey",
      }),
    };
  }
);

export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  personId: uuid("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade", onUpdate: "cascade" }),
  amount: doublePrecision("amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
