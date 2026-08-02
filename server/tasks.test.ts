import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("tasks router", () => {
  it("should list tasks for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This will call the actual database
    const tasks = await caller.tasks.list();
    expect(Array.isArray(tasks)).toBe(true);
  });

  it("should create a task", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.create({
      title: "Test Task",
      description: "Test Description",
      pillar: "Google",
      startDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "A Fazer",
      priority: "Média",
      progress: 0,
    });

    expect(result).toBeDefined();
  });

  it("should filter tasks by status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tasks = await caller.tasks.list({
      status: ["A Fazer"],
    });

    expect(Array.isArray(tasks)).toBe(true);
    tasks.forEach(task => {
      expect(task.status).toBe("A Fazer");
    });
  });

  it("should filter tasks by pillar", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tasks = await caller.tasks.list({
      pillar: ["Google"],
    });

    expect(Array.isArray(tasks)).toBe(true);
    tasks.forEach(task => {
      expect(task.pillar).toBe("Google");
    });
  });

  it("should update a task", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a task
    const created = await caller.tasks.create({
      title: "Test Task",
      description: "Test Description",
      pillar: "Google",
      startDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "A Fazer",
      priority: "Média",
      progress: 0,
    });

    if (!created || !created.id) {
      throw new Error("Failed to create task");
    }

    // Then update it
    const updated = await caller.tasks.update({
      id: created.id,
      title: "Updated Task",
      status: "Em Andamento",
      progress: 50,
    });

    expect(updated.title).toBe("Updated Task");
    expect(updated.status).toBe("Em Andamento");
    expect(updated.progress).toBe(50);
  });

  it("should delete a task", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a task
    const created = await caller.tasks.create({
      title: "Test Task to Delete",
      description: "Test Description",
      pillar: "Google",
      startDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "A Fazer",
      priority: "Média",
      progress: 0,
    });

    if (!created || !created.id) {
      throw new Error("Failed to create task");
    }

    // Then delete it
    await caller.tasks.delete({ id: created.id });
    
    // Verify it was deleted
    const deleted = await caller.tasks.getById({ id: created.id });
    expect(deleted).toBeNull();
  });
});

describe("phases router", () => {
  it("should list phases for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const phases = await caller.phases.list();
    expect(Array.isArray(phases)).toBe(true);
  });

  it("should create a phase", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.phases.create({
      title: "Test Phase",
      pillar: "Google",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    expect(result).toBeDefined();
  });
});
