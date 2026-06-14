import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "MEDIATOR"]);
export const userStatusEnum = pgEnum("user_status", ["PENDING", "ACTIVE", "SUSPENDED"]);
export const propertyStatusEnum = pgEnum("property_status", ["ACTIVE", "SUSPENDED", "SOLD"]);
export const mediationTypeEnum = pgEnum("mediation_type", ["EXCLUSIVE", "OPEN"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  nif: text("nif"),
  role: userRoleEnum("role").notNull().default("MEDIATOR"),
  status: userStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referenceId: text("reference_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  areaHa: integer("area_ha").notNull(),
  price: integer("price").notNull(),
  mediationType: mediationTypeEnum("mediation_type").notNull().default("OPEN"),
  status: propertyStatusEnum("status").notNull().default("ACTIVE"),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  socialLinks: text("social_links").notNull().default('[]'),
  ownerMediatorId: varchar("owner_mediator_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  nif: text("nif").notNull(),
  propertyId: varchar("property_id").references(() => properties.id),
  mediatorId: varchar("mediator_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  referenceId: true,
  ownerMediatorId: true,
}).extend({
  images: z.array(z.string()).optional().default([]),
  socialLinks: z.string().optional().default('[]'),
  ownerMediatorId: z.string().optional(), // Opcional para permitir que admin selecione o mediador
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

// Select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectPropertySchema = createSelectSchema(properties);
export const selectLeadSchema = createSelectSchema(leads);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
