import { eq, and, desc, or, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tasks, phases, InsertTask, Task, InsertPhase, Phase } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Task queries
export async function getUserTasks(userId: number, filters?: {
  status?: string[];
  priority?: string[];
  pillar?: string[];
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(tasks.userId, userId)];
  
  if (filters?.status && filters.status.length > 0) {
    conditions.push(inArray(tasks.status, filters.status as any));
  }
  if (filters?.priority && filters.priority.length > 0) {
    conditions.push(inArray(tasks.priority, filters.priority as any));
  }
  if (filters?.pillar && filters.pillar.length > 0) {
    conditions.push(inArray(tasks.pillar, filters.pillar as any));
  }
  
  return db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt));
}

export async function createTask(task: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tasks).values(task);
  // Get the last inserted task
  const result = await db.select().from(tasks).where(eq(tasks.userId, task.userId)).orderBy(desc(tasks.createdAt)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTask(taskId: number, updates: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(updates).where(eq(tasks.id, taskId));
  // Return the updated task
  return getTaskById(taskId);
}

export async function deleteTask(taskId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(tasks).where(eq(tasks.id, taskId));
}

export async function getTaskById(taskId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Phase queries
export async function getUserPhases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(phases).where(eq(phases.userId, userId)).orderBy(desc(phases.createdAt));
}

export async function createPhase(phase: InsertPhase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(phases).values(phase);
}

export async function updatePhase(phaseId: number, updates: Partial<InsertPhase>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(phases).set(updates).where(eq(phases.id, phaseId));
}

export async function deletePhase(phaseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(phases).where(eq(phases.id, phaseId));
}

export async function getPhaseById(phaseId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(phases).where(eq(phases.id, phaseId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
