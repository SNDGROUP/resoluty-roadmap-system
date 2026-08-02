import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Pilares estratégicos (enums)
export const pillarEnum = mysqlEnum("pillar", [
  "Google",
  "Redes Sociais",
  "GoHighLevel",
  "Make.com",
  "Ferramentas Complementares",
]);

// Status das tarefas
export const statusEnum = mysqlEnum("status", [
  "A Fazer",
  "Em Andamento",
  "Concluído",
  "Atrasado",
]);

// Prioridade das tarefas
export const priorityEnum = mysqlEnum("priority", [
  "Baixa",
  "Média",
  "Alta",
  "Crítica",
]);

/**
 * Tabela de fases do roadmap (agrupamentos estratégicos)
 */
export const phases = mysqlTable("phases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  pillar: pillarEnum.notNull(),
  description: text("description"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  color: varchar("color", { length: 7 }).default("#1A237E").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Phase = typeof phases.$inferSelect;
export type InsertPhase = typeof phases.$inferInsert;

/**
 * Tabela de tarefas do roadmap
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  phaseId: int("phaseId").references(() => phases.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  pillar: pillarEnum.notNull(),
  assignee: varchar("assignee", { length: 255 }),
  startDate: timestamp("startDate").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  status: statusEnum.default("A Fazer").notNull(),
  priority: priorityEnum.default("Média").notNull(),
  progress: int("progress").default(0).notNull(), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
