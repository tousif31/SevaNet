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
  badges: jsonb("badges").default([]),
  reportCount: integer("report_count").default(0),
  updateCount: integer("update_count").default(0),
  completedCount: integer("completed_count").default(0),
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

// Badge definitions
export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  criteria: {
    type: 'reports' | 'updates' | 'completed';
    count: number;
  };
};

export const badgeDefinitions: Badge[] = [
  {
    id: 'first-report',
    name: 'First Report',
    description: 'You submitted your first report',
    icon: 'star',
    level: 1,
    criteria: { type: 'reports', count: 1 }
  },
  {
    id: 'active-reporter',
    name: 'Active Reporter',
    description: 'You submitted 5 reports',
    icon: 'award',
    level: 2,
    criteria: { type: 'reports', count: 5 }
  },
  {
    id: 'super-reporter',
    name: 'Super Reporter',
    description: 'You submitted 10 reports',
    icon: 'trophy',
    level: 3,
    criteria: { type: 'reports', count: 10 }
  },
  {
    id: 'first-update',
    name: 'First Update',
    description: 'You added your first update',
    icon: 'message-circle',
    level: 1,
    criteria: { type: 'updates', count: 1 }
  },
  {
    id: 'active-commenter',
    name: 'Active Commenter',
    description: 'You added 5 updates',
    icon: 'message-square',
    level: 2,
    criteria: { type: 'updates', count: 5 }
  },
  {
    id: 'first-completed',
    name: 'First Completion',
    description: 'You had your first issue resolved',
    icon: 'check-circle',
    level: 1,
    criteria: { type: 'completed', count: 1 }
  },
  {
    id: 'problem-solver',
    name: 'Problem Solver',
    description: 'You had 5 issues resolved',
    icon: 'check-square',
    level: 2,
    criteria: { type: 'completed', count: 5 }
  }
];
