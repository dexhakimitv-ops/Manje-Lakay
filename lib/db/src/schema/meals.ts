import { createInsertSchema } from "drizzle-zod";
import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const mealsTable = pgTable("meals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  photoUrl: text("photo_url"),
  available: boolean("available").notNull().default(true),
  restaurantName: text("restaurant_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  deliveryArea: text("delivery_area").notNull(),
  rating: text("rating").notNull().default("4.8"),
  eta: text("eta").notNull().default("25–35 min"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMealSchema = createInsertSchema(mealsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof mealsTable.$inferSelect;