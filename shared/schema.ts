import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("farmer"),
  region: text("region"),
  status: text("status").notNull().default("active"),
  lastActive: timestamp("last_active", { withTimezone: true }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
  region: true,
  status: true,
});

// Content model
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // marketplace, guide, chat
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  ownerId: integer("owner_id").notNull(), // reference to user
  reported: boolean("reported").default(false),
  reportReason: text("report_reason"),
  region: text("region"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertContentSchema = createInsertSchema(contents).pick({
  title: true,
  description: true,
  type: true,
  status: true,
  ownerId: true,
  reported: true,
  reportReason: true,
  region: true,
});

// Feature flags model
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  enabled: boolean("enabled").default(true),
  scope: text("scope").default("global"), // global, region specific, beta users
  regions: text("regions").array(), // array of region names
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
  updatedBy: integer("updated_by"), // reference to admin user
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).pick({
  name: true,
  description: true,
  enabled: true,
  scope: true,
  regions: true,
  updatedBy: true,
});

// Audit logs model
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id"), // reference to admin user
  action: text("action").notNull(), // user_deletion, content_moderation, feature_toggle, etc.
  metadata: jsonb("metadata"), // additional info about the action
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  adminId: true,
  action: true,
  metadata: true,
});

// Compliance reports model
export const complianceReports = pgTable("compliance_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // crop yield, fertilizer usage, gdpr
  frequency: text("frequency").notNull(), // weekly, monthly, quarterly
  lastGenerated: timestamp("last_generated", { withTimezone: true }).defaultNow(),
  status: text("status").notNull().default("generated"), // generated, pending_action
  pendingActions: integer("pending_actions").default(0),
  region: text("region"),
});

export const insertComplianceReportSchema = createInsertSchema(complianceReports).pick({
  title: true,
  description: true,
  type: true,
  frequency: true,
  status: true,
  pendingActions: true,
  region: true,
});

// System metrics model
export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  type: text("type").notNull(), // users, content, moderation, health
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
});

export const insertSystemMetricSchema = createInsertSchema(systemMetrics).pick({
  name: true,
  value: true,
  type: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contents.$inferSelect;

export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;
export type FeatureFlag = typeof featureFlags.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertComplianceReport = z.infer<typeof insertComplianceReportSchema>;
export type ComplianceReport = typeof complianceReports.$inferSelect;

export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;
export type SystemMetric = typeof systemMetrics.$inferSelect;

// Market - Produce Prices
export const produceMarket = pgTable("produce_market", {
  id: serial("id").primaryKey(),
  produceName: text("produce_name").notNull(),
  category: text("category").notNull(),
  price: text("price").notNull(),
  previousPrice: text("previous_price").notNull(),
  change: text("change").notNull(),
  percentChange: text("percent_change").notNull(),
  region: text("region").notNull(),
  date: text("date").notNull(),
  source: text("source").notNull(),
  status: text("status").notNull(), // "rising" | "falling" | "stable"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProduceMarketSchema = createInsertSchema(produceMarket).pick({
  produceName: true,
  category: true,
  price: true,
  previousPrice: true,
  change: true,
  percentChange: true,
  region: true,
  date: true,
  source: true,
  status: true,
});

export type InsertProduceMarket = z.infer<typeof insertProduceMarketSchema>;
export type ProduceMarket = typeof produceMarket.$inferSelect;
