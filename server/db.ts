import postgres from "postgres";
import { InsertUser, InsertTask, Task, InsertPhase, Phase, User } from "../drizzle/schema";
import { ENV } from './_core/env';

// Postgres client instance for Supabase
let pgSql: ReturnType<typeof postgres> | null = null;

let tablesInitialized = false;

export function getPostgresClient() {
  const connectionString = ENV.postgresUrl || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!pgSql && connectionString && (connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://"))) {
    try {
      pgSql = postgres(connectionString, {
        ssl: "require",
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      console.log("[Database] Connected to PostgreSQL");
    } catch (err) {
      console.warn("[Database] Failed to connect to Postgres:", err);
      pgSql = null;
    }
  }

  if (pgSql && !tablesInitialized) {
    tablesInitialized = true;
    pgSql`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        open_id VARCHAR(64) UNIQUE NOT NULL,
        name TEXT,
        email VARCHAR(320),
        login_method VARCHAR(64),
        role VARCHAR(32) DEFAULT 'user' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        last_signed_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE TABLE IF NOT EXISTS public.phases (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        pillar VARCHAR(64) NOT NULL,
        description TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        color VARCHAR(7) DEFAULT '#1A237E' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE TABLE IF NOT EXISTS public.tasks (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        phase_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        pillar VARCHAR(64) NOT NULL,
        assignee VARCHAR(255),
        start_date TIMESTAMP NOT NULL,
        due_date TIMESTAMP NOT NULL,
        status VARCHAR(64) DEFAULT 'A Fazer' NOT NULL,
        priority VARCHAR(64) DEFAULT 'Média' NOT NULL,
        progress INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `.catch(err => {
      console.warn("[Database] Table auto-creation warning:", err);
    });
  }

  return pgSql;
}

// In-memory fallback state
const memoryUsers = new Map<string, User>();
let memoryUserIdCounter = 1;

const memoryTasks = new Map<number, Task>();
let memoryTaskIdCounter = 1;

const memoryPhases = new Map<number, Phase>();
let memoryPhaseIdCounter = 1;

let isMemorySeeded = false;

function ensureMemorySeeded(userId: number) {
  if (isMemorySeeded) return;
  isMemorySeeded = true;

  const now = new Date();

  // Seed initial phases
  const initialPhases = [
    {
      title: "Fase 1: Fundação",
      pillar: "Google" as const,
      description: "Estruturação base do projeto",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-15"),
      color: "#FCD34D",
    },
    {
      title: "Fase 2: Execução",
      pillar: "Google" as const,
      description: "Implementação das funcionalidades",
      startDate: new Date("2026-08-16"),
      endDate: new Date("2026-09-15"),
      color: "#FCD34D",
    },
    {
      title: "Fase 3: Otimização",
      pillar: "Google" as const,
      description: "Otimizações e ajustes finais",
      startDate: new Date("2026-09-16"),
      endDate: new Date("2026-10-01"),
      color: "#FCD34D",
    },
  ];

  for (const p of initialPhases) {
    const id = memoryPhaseIdCounter++;
    memoryPhases.set(id, {
      id,
      userId,
      title: p.title,
      pillar: p.pillar,
      description: p.description,
      startDate: p.startDate,
      endDate: p.endDate,
      color: p.color,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Seed initial tasks
  const initialTasks = [
    {
      title: "Estrutura de Funnel",
      description: "Configurar estrutura base de funil de vendas",
      pillar: "Google" as const,
      assignee: "Equipe Google",
      startDate: new Date("2026-07-31"),
      dueDate: new Date("2026-08-10"),
      status: "A Fazer" as const,
      priority: "Crítica" as const,
      progress: 0,
    },
    {
      title: "Produção Site Novo",
      description: "Criar novo site com otimizações SEO",
      pillar: "Google" as const,
      assignee: "Dev Team",
      startDate: new Date("2026-08-05"),
      dueDate: new Date("2026-08-20"),
      status: "A Fazer" as const,
      priority: "Alta" as const,
      progress: 0,
    },
    {
      title: "SEO Páginas",
      description: "Otimizar páginas para SEO",
      pillar: "Google" as const,
      assignee: "SEO Specialist",
      startDate: new Date("2026-08-12"),
      dueDate: new Date("2026-08-25"),
      status: "A Fazer" as const,
      priority: "Alta" as const,
      progress: 0,
    },
    {
      title: "Rastreamento",
      description: "Implementar rastreamento de conversões",
      pillar: "Google" as const,
      assignee: "Analytics Team",
      startDate: new Date("2026-08-20"),
      dueDate: new Date("2026-09-02"),
      status: "A Fazer" as const,
      priority: "Média" as const,
      progress: 0,
    },
    {
      title: "Organização dos Arquivos (Empresas)",
      description: "Organizar arquivos de redes sociais",
      pillar: "Redes Sociais" as const,
      assignee: "Social Media Team",
      startDate: new Date("2026-07-31"),
      dueDate: new Date("2026-08-08"),
      status: "Em Andamento" as const,
      priority: "Média" as const,
      progress: 50,
    },
    {
      title: "Vídeos Orgânicos",
      description: "Produzir conteúdo de vídeos orgânicos",
      pillar: "Redes Sociais" as const,
      assignee: "Content Creator",
      startDate: new Date("2026-08-02"),
      dueDate: new Date("2026-08-18"),
      status: "Em Andamento" as const,
      priority: "Alta" as const,
      progress: 30,
    },
    {
      title: "Editar GHL - Nível Agência",
      description: "Editar configurações do GoHighLevel",
      pillar: "Redes Sociais" as const,
      assignee: "GHL Specialist",
      startDate: new Date("2026-08-10"),
      dueDate: new Date("2026-08-22"),
      status: "A Fazer" as const,
      priority: "Média" as const,
      progress: 0,
    },
    {
      title: "Limpeza de TAGs",
      description: "Limpar e organizar tags no GoHighLevel",
      pillar: "GoHighLevel" as const,
      assignee: "GHL Admin",
      startDate: new Date("2026-08-01"),
      dueDate: new Date("2026-08-10"),
      status: "Em Andamento" as const,
      priority: "Média" as const,
      progress: 60,
    },
    {
      title: "Limpeza Métodos de",
      description: "Organizar métodos de comunicação",
      pillar: "GoHighLevel" as const,
      assignee: "GHL Admin",
      startDate: new Date("2026-08-08"),
      dueDate: new Date("2026-08-18"),
      status: "A Fazer" as const,
      priority: "Média" as const,
      progress: 0,
    },
    {
      title: "Limpeza GHL",
      description: "Limpeza geral do sistema GoHighLevel",
      pillar: "GoHighLevel" as const,
      assignee: "GHL Team",
      startDate: new Date("2026-08-15"),
      dueDate: new Date("2026-08-28"),
      status: "A Fazer" as const,
      priority: "Alta" as const,
      progress: 0,
    },
    {
      title: "Transcrever Vídeo Zoe Divídas",
      description: "Transcrever vídeo para automação",
      pillar: "Make.com" as const,
      assignee: "Automation Team",
      startDate: new Date("2026-08-03"),
      dueDate: new Date("2026-08-12"),
      status: "A Fazer" as const,
      priority: "Média" as const,
      progress: 0,
    },
    {
      title: "Tratamento de Habilidade e Nic",
      description: "Processar dados de habilidades",
      pillar: "Make.com" as const,
      assignee: "Data Team",
      startDate: new Date("2026-08-10"),
      dueDate: new Date("2026-08-22"),
      status: "A Fazer" as const,
      priority: "Média" as const,
      progress: 0,
    },
    {
      title: "Tratamento e Estrutura (Estudo Disney / Resultado)",
      description: "Estruturar dados de estudo",
      pillar: "Make.com" as const,
      assignee: "Analytics Team",
      startDate: new Date("2026-08-15"),
      dueDate: new Date("2026-08-28"),
      status: "A Fazer" as const,
      priority: "Alta" as const,
      progress: 0,
    },
    {
      title: "Moster o Layout Planejamento Financeiro",
      description: "Apresentar layout de planejamento",
      pillar: "Ferramentas Complementares" as const,
      assignee: "Design Team",
      startDate: new Date("2026-08-18"),
      dueDate: new Date("2026-08-28"),
      status: "A Fazer" as const,
      priority: "Média" as const,
      progress: 0,
    },
    {
      title: "Sistemas Consultivos (Obsidian)",
      description: "Configurar sistema de consultoria",
      pillar: "Ferramentas Complementares" as const,
      assignee: "Knowledge Manager",
      startDate: new Date("2026-08-20"),
      dueDate: new Date("2026-09-02"),
      status: "A Fazer" as const,
      priority: "Média" as const,
      progress: 0,
    },
    {
      title: "Acertos de Anuncios + Resultados",
      description: "Ajustar anúncios e medir resultados",
      pillar: "Ferramentas Complementares" as const,
      assignee: "Ads Manager",
      startDate: new Date("2026-09-01"),
      dueDate: new Date("2026-09-20"),
      status: "A Fazer" as const,
      priority: "Alta" as const,
      progress: 0,
    },
  ];

  for (const t of initialTasks) {
    const id = memoryTaskIdCounter++;
    memoryTasks.set(id, {
      id,
      userId,
      title: t.title,
      description: t.description || null,
      pillar: t.pillar,
      assignee: t.assignee || null,
      startDate: t.startDate,
      dueDate: t.dueDate,
      status: t.status,
      priority: t.priority,
      progress: t.progress,
      phaseId: null,
      createdAt: now,
      updatedAt: now,
    });
  }
}

// Helpers to format PostgreSQL rows to app objects
function mapPgUser(row: any): User {
  return {
    id: row.id,
    openId: row.open_id || row.openId,
    name: row.name ?? null,
    email: row.email ?? null,
    loginMethod: row.login_method || row.loginMethod || null,
    role: row.role || "user",
    createdAt: new Date(row.created_at || row.createdAt),
    updatedAt: new Date(row.updated_at || row.updatedAt),
    lastSignedIn: new Date(row.last_signed_in || row.lastSignedIn),
  };
}

function mapPgPhase(row: any): Phase {
  return {
    id: row.id,
    userId: row.user_id || row.userId,
    title: row.title,
    pillar: row.pillar,
    description: row.description ?? null,
    startDate: new Date(row.start_date || row.startDate),
    endDate: new Date(row.end_date || row.endDate),
    color: row.color || "#1A237E",
    createdAt: new Date(row.created_at || row.createdAt),
    updatedAt: new Date(row.updated_at || row.updatedAt),
  };
}

function mapPgTask(row: any): Task {
  return {
    id: row.id,
    userId: row.user_id || row.userId,
    phaseId: row.phase_id || row.phaseId || null,
    title: row.title,
    description: row.description ?? null,
    pillar: row.pillar,
    assignee: row.assignee ?? null,
    startDate: new Date(row.start_date || row.startDate),
    dueDate: new Date(row.due_date || row.dueDate),
    status: row.status || "A Fazer",
    priority: row.priority || "Média",
    progress: row.progress ?? 0,
    createdAt: new Date(row.created_at || row.createdAt),
    updatedAt: new Date(row.updated_at || row.updatedAt),
  };
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const sql = getPostgresClient();
  if (sql) {
    try {
      const now = new Date();
      const role = user.role || (user.openId === ENV.ownerOpenId ? "admin" : "user");
      await sql`
        INSERT INTO public.users (open_id, name, email, login_method, role, last_signed_in, updated_at)
        VALUES (${user.openId}, ${user.name ?? null}, ${user.email ?? null}, ${user.loginMethod ?? null}, ${role}, ${user.lastSignedIn || now}, ${now})
        ON CONFLICT (open_id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          login_method = EXCLUDED.login_method,
          role = EXCLUDED.role,
          last_signed_in = EXCLUDED.last_signed_in,
          updated_at = EXCLUDED.updated_at
      `;
      return;
    } catch (err) {
      console.error("[Database] Error upserting user in Postgres:", err);
    }
  }

  // Memory fallback
  let existing = memoryUsers.get(user.openId);
  const now = new Date();
  if (!existing) {
    const id = memoryUserIdCounter++;
    existing = {
      id,
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
      createdAt: now,
      updatedAt: now,
      lastSignedIn: user.lastSignedIn ?? now,
    };
    memoryUsers.set(user.openId, existing);
    ensureMemorySeeded(id);
  } else {
    if (user.name !== undefined) existing.name = user.name;
    if (user.email !== undefined) existing.email = user.email;
    if (user.loginMethod !== undefined) existing.loginMethod = user.loginMethod;
    if (user.role !== undefined) existing.role = user.role;
    if (user.lastSignedIn !== undefined) existing.lastSignedIn = user.lastSignedIn;
    existing.updatedAt = now;
    memoryUsers.set(user.openId, existing);
  }
}

export async function getUserByOpenId(openId: string) {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM public.users WHERE open_id = ${openId} LIMIT 1`;
      if (rows.length > 0) {
        return mapPgUser(rows[0]);
      }
    } catch (err) {
      console.error("[Database] Error fetching user from Postgres:", err);
    }
  }

  // Memory fallback
  let user = memoryUsers.get(openId);
  if (!user) {
    const id = memoryUserIdCounter++;
    const now = new Date();
    user = {
      id,
      openId,
      name: "Usuário Resoluty",
      email: "demo@resoluty.com",
      loginMethod: "oauth",
      role: openId === ENV.ownerOpenId ? "admin" : "user",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    };
    memoryUsers.set(openId, user);
    ensureMemorySeeded(id);
  }
  return user;
}

// Task queries
export async function getUserTasks(userId: number, filters?: {
  status?: string[];
  priority?: string[];
  pillar?: string[];
}) {
  const sql = getPostgresClient();
  if (sql) {
    try {
      let query = sql`SELECT * FROM public.tasks WHERE user_id = ${userId}`;
      const rows = await sql`
        SELECT * FROM public.tasks 
        WHERE user_id = ${userId}
        ${filters?.status && filters.status.length > 0 ? sql`AND status = ANY(${filters.status})` : sql``}
        ${filters?.priority && filters.priority.length > 0 ? sql`AND priority = ANY(${filters.priority})` : sql``}
        ${filters?.pillar && filters.pillar.length > 0 ? sql`AND pillar = ANY(${filters.pillar})` : sql``}
        ORDER BY created_at DESC
      `;
      return rows.map(mapPgTask);
    } catch (err) {
      console.error("[Database] Error fetching tasks from Postgres:", err);
    }
  }

  // Memory fallback
  ensureMemorySeeded(userId);
  let list = Array.from(memoryTasks.values()).filter(t => t.userId === userId);
  if (filters?.status && filters.status.length > 0) {
    list = list.filter(t => filters.status!.includes(t.status));
  }
  if (filters?.priority && filters.priority.length > 0) {
    list = list.filter(t => filters.priority!.includes(t.priority));
  }
  if (filters?.pillar && filters.pillar.length > 0) {
    list = list.filter(t => filters.pillar!.includes(t.pillar));
  }
  return list.sort((a, b) => (new Date(b.createdAt).getTime()) - (new Date(a.createdAt).getTime()));
}

export async function createTask(task: InsertTask) {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const now = new Date();
      const rows = await sql`
        INSERT INTO public.tasks (
          user_id, phase_id, title, description, pillar, assignee, start_date, due_date, status, priority, progress, created_at, updated_at
        ) VALUES (
          ${task.userId}, ${task.phaseId ?? null}, ${task.title}, ${task.description ?? null}, ${task.pillar}, ${task.assignee ?? null},
          ${new Date(task.startDate)}, ${new Date(task.dueDate)}, ${task.status ?? "A Fazer"}, ${task.priority ?? "Média"}, ${task.progress ?? 0}, ${now}, ${now}
        )
        RETURNING *
      `;
      return rows.length > 0 ? mapPgTask(rows[0]) : null;
    } catch (err) {
      console.error("[Database] Error creating task in Postgres:", err);
    }
  }

  // Memory fallback
  ensureMemorySeeded(task.userId);
  const id = memoryTaskIdCounter++;
  const now = new Date();
  const newTask: Task = {
    id,
    userId: task.userId,
    title: task.title,
    description: task.description ?? null,
    pillar: task.pillar,
    assignee: task.assignee ?? null,
    startDate: task.startDate,
    dueDate: task.dueDate,
    status: task.status ?? "A Fazer",
    priority: task.priority ?? "Média",
    progress: task.progress ?? 0,
    phaseId: task.phaseId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  memoryTasks.set(id, newTask);
  return newTask;
}

export async function updateTask(taskId: number, updates: Partial<InsertTask>) {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const now = new Date();
      const rows = await sql`
        UPDATE public.tasks SET
          title = COALESCE(${updates.title ?? null}, title),
          description = COALESCE(${updates.description ?? null}, description),
          pillar = COALESCE(${updates.pillar ?? null}, pillar),
          assignee = COALESCE(${updates.assignee ?? null}, assignee),
          start_date = COALESCE(${updates.startDate ? new Date(updates.startDate) : null}, start_date),
          due_date = COALESCE(${updates.dueDate ? new Date(updates.dueDate) : null}, due_date),
          status = COALESCE(${updates.status ?? null}, status),
          priority = COALESCE(${updates.priority ?? null}, priority),
          progress = COALESCE(${updates.progress ?? null}, progress),
          phase_id = COALESCE(${updates.phaseId ?? null}, phase_id),
          updated_at = ${now}
        WHERE id = ${taskId}
        RETURNING *
      `;
      return rows.length > 0 ? mapPgTask(rows[0]) : null;
    } catch (err) {
      console.error("[Database] Error updating task in Postgres:", err);
    }
  }

  // Memory fallback
  const existing = memoryTasks.get(taskId);
  if (!existing) return null;
  const updated: Task = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };
  memoryTasks.set(taskId, updated);
  return updated;
}

export async function deleteTask(taskId: number) {
  const sql = getPostgresClient();
  if (sql) {
    try {
      await sql`DELETE FROM public.tasks WHERE id = ${taskId}`;
      return { changes: 1 };
    } catch (err) {
      console.error("[Database] Error deleting task in Postgres:", err);
    }
  }

  // Memory fallback
  memoryTasks.delete(taskId);
  return { changes: 1 };
}

export async function getTaskById(taskId: number) {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM public.tasks WHERE id = ${taskId} LIMIT 1`;
      return rows.length > 0 ? mapPgTask(rows[0]) : null;
    } catch (err) {
      console.error("[Database] Error fetching task by id from Postgres:", err);
    }
  }

  // Memory fallback
  return memoryTasks.get(taskId) || null;
}

// Phase queries
export async function getUserPhases(userId: number) {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM public.phases WHERE user_id = ${userId} ORDER BY created_at DESC`;
      return rows.map(mapPgPhase);
    } catch (err) {
      console.error("[Database] Error fetching phases from Postgres:", err);
    }
  }

  // Memory fallback
  ensureMemorySeeded(userId);
  const list = Array.from(memoryPhases.values()).filter(p => p.userId === userId);
  return list.sort((a, b) => (new Date(b.createdAt).getTime()) - (new Date(a.createdAt).getTime()));
}

export async function createPhase(phase: InsertPhase) {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const now = new Date();
      const rows = await sql`
        INSERT INTO public.phases (
          user_id, title, pillar, description, start_date, end_date, color, created_at, updated_at
        ) VALUES (
          ${phase.userId}, ${phase.title}, ${phase.pillar}, ${phase.description ?? null},
          ${new Date(phase.startDate)}, ${new Date(phase.endDate)}, ${phase.color ?? "#1A237E"}, ${now}, ${now}
        )
        RETURNING *
      `;
      return rows.length > 0 ? mapPgPhase(rows[0]) : null;
    } catch (err) {
      console.error("[Database] Error creating phase in Postgres:", err);
    }
  }

  // Memory fallback
  ensureMemorySeeded(phase.userId);
  const id = memoryPhaseIdCounter++;
  const now = new Date();
  const newPhase: Phase = {
    id,
    userId: phase.userId,
    title: phase.title,
    pillar: phase.pillar,
    description: phase.description ?? null,
    startDate: phase.startDate,
    endDate: phase.endDate,
    color: phase.color ?? "#1A237E",
    createdAt: now,
    updatedAt: now,
  };
  memoryPhases.set(id, newPhase);
  return newPhase;
}

export async function updatePhase(phaseId: number, updates: Partial<InsertPhase>) {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const now = new Date();
      const rows = await sql`
        UPDATE public.phases SET
          title = COALESCE(${updates.title ?? null}, title),
          pillar = COALESCE(${updates.pillar ?? null}, pillar),
          description = COALESCE(${updates.description ?? null}, description),
          start_date = COALESCE(${updates.startDate ? new Date(updates.startDate) : null}, start_date),
          end_date = COALESCE(${updates.endDate ? new Date(updates.endDate) : null}, end_date),
          color = COALESCE(${updates.color ?? null}, color),
          updated_at = ${now}
        WHERE id = ${phaseId}
        RETURNING *
      `;
      return rows.length > 0 ? mapPgPhase(rows[0]) : null;
    } catch (err) {
      console.error("[Database] Error updating phase in Postgres:", err);
    }
  }

  // Memory fallback
  const existing = memoryPhases.get(phaseId);
  if (!existing) return null;
  const updated: Phase = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };
  memoryPhases.set(phaseId, updated);
  return updated;
}

export async function deletePhase(phaseId: number) {
  const sql = getPostgresClient();
  if (sql) {
    try {
      await sql`DELETE FROM public.phases WHERE id = ${phaseId}`;
      return { changes: 1 };
    } catch (err) {
      console.error("[Database] Error deleting phase in Postgres:", err);
    }
  }

  // Memory fallback
  memoryPhases.delete(phaseId);
  return { changes: 1 };
}

export async function getPhaseById(phaseId: number) {
  const sql = getPostgresClient();
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM public.phases WHERE id = ${phaseId} LIMIT 1`;
      return rows.length > 0 ? mapPgPhase(rows[0]) : null;
    } catch (err) {
      console.error("[Database] Error fetching phase by id from Postgres:", err);
    }
  }

  // Memory fallback
  return memoryPhases.get(phaseId) || null;
}
