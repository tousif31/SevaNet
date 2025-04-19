import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define tables first
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  address: text("address").notNull(),
  neighborhood: text("neighborhood"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  status: text("status").notNull().default("pending"),
  userId: integer("user_id").notNull(),
  assignedTo: text("assigned_to"),
  photos: jsonb("photos").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Then define relations
export const usersRelations = relations(users, ({ many }) => ({
  reports: many(reports),
  updates: many(updates),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
  updates: many(updates),
}));

export const updatesRelations = relations(updates, ({ one }) => ({
  report: one(reports, {
    fields: [updates.reportId],
    references: [reports.id],
  }),
  user: one(users, {
    fields: [updates.userId],
    references: [users.id],
  }),
}));

// Then define schemas and types
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertReportSchema = createInsertSchema(reports).pick({
  title: true,
  description: true,
  category: true,
  address: true,
  neighborhood: true,
  latitude: true,
  longitude: true,
  userId: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export const insertUpdateSchema = createInsertSchema(updates).pick({
  reportId: true,
  userId: true,
  content: true,
});

export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type Update = typeof updates.$inferSelect;

// Constants
export const categories = [
  "road-damage",
  "garbage", 
  "street-light", 
  "water-sewage", 
  "other"
];

export const categoriesDisplay = {
  "road-damage": "Road Damage",
  "garbage": "Garbage",
  "street-light": "Street Light", 
  "water-sewage": "Water Sewage",
  "other": "Other"
};

export const reportStatuses = [
  "pending",
  "in-progress",
  "assigned",
  "completed"
];

export const statusDisplay = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "assigned": "Assigned",
  "completed": "Completed"
};
