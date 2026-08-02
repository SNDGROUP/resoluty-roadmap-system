import { COOKIE_NAME } from "@shared/const";
import { eq } from "drizzle-orm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { InsertTask, InsertPhase } from "../drizzle/schema";
import { seedDatabase } from "./seedData";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async (opts) => {
      const user = opts.ctx.user;
      if (user) {
        // Seed database on first login
        await seedDatabase(user.id).catch(() => {});
      }
      return user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      if (typeof (ctx.res as any)?.clearCookie === "function") {
        (ctx.res as any).clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      }
      return {
        success: true,
      } as const;
    }),
  }),

  tasks: router({
    list: protectedProcedure
      .input(z.object({
        status: z.array(z.string()).optional(),
        priority: z.array(z.string()).optional(),
        pillar: z.array(z.string()).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        let tasks = await db.getUserTasks(ctx.user.id, input);
        if (!tasks || tasks.length === 0) {
          await seedDatabase(ctx.user.id).catch(() => {});
          tasks = await db.getUserTasks(ctx.user.id, input);
        }
        return tasks;
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        pillar: z.enum(["Google", "Redes Sociais", "GoHighLevel", "Make.com", "Ferramentas Complementares"]),
        assignee: z.string().optional(),
        startDate: z.date(),
        dueDate: z.date(),
        status: z.enum(["A Fazer", "Em Andamento", "Concluído", "Atrasado"]).default("A Fazer"),
        priority: z.enum(["Baixa", "Média", "Alta", "Crítica"]).default("Média"),
        progress: z.number().min(0).max(100).default(0),
        phaseId: z.number().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const task: InsertTask = {
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          pillar: input.pillar,
          assignee: input.assignee,
          startDate: input.startDate,
          dueDate: input.dueDate,
          status: input.status,
          priority: input.priority,
          progress: input.progress,
          phaseId: input.phaseId,
        };
        return db.createTask(task);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        pillar: z.enum(["Google", "Redes Sociais", "GoHighLevel", "Make.com", "Ferramentas Complementares"]).optional(),
        assignee: z.string().optional(),
        startDate: z.date().optional(),
        dueDate: z.date().optional(),
        status: z.enum(["A Fazer", "Em Andamento", "Concluído", "Atrasado"]).optional(),
        priority: z.enum(["Baixa", "Média", "Alta", "Crítica"]).optional(),
        progress: z.number().min(0).max(100).optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...updates } = input;
        return db.updateTask(id, updates);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteTask(input.id)),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getTaskById(input.id)),
  }),

  phases: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserPhases(ctx.user.id)),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        pillar: z.enum(["Google", "Redes Sociais", "GoHighLevel", "Make.com", "Ferramentas Complementares"]),
        description: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).default("#1A237E"),
      }))
      .mutation(({ ctx, input }) => {
        const phase: InsertPhase = {
          userId: ctx.user.id,
          title: input.title,
          pillar: input.pillar,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          color: input.color,
        };
        return db.createPhase(phase);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        pillar: z.enum(["Google", "Redes Sociais", "GoHighLevel", "Make.com", "Ferramentas Complementares"]).optional(),
        description: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...updates } = input;
        return db.updatePhase(id, updates);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deletePhase(input.id)),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getPhaseById(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
