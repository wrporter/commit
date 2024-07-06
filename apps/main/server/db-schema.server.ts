import { serial, text, timestamp, pgTable } from "drizzle-orm/pg-core";

export const contact = pgTable("contact", {
    id: serial("id"),
    name: text("name"),
    email: text("email"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});
