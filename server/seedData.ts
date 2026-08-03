import { createTask, createPhase, getUserPhases, getUserTasks } from "./db";

const INITIAL_TASKS_TEMPLATE = [
  // Google Pillar
  {
    title: "Estrutura de Funnel",
    description: "Configurar estrutura base de funil de vendas",
    pillar: "Google",
    assignee: "Equipe Google",
    startDate: new Date("2026-07-31"),
    dueDate: new Date("2026-08-10"),
    status: "A Fazer",
    priority: "Crítica",
    progress: 0,
  },
  {
    title: "Produção Site Novo",
    description: "Criar novo site com otimizações SEO",
    pillar: "Google",
    assignee: "Dev Team",
    startDate: new Date("2026-08-05"),
    dueDate: new Date("2026-08-20"),
    status: "A Fazer",
    priority: "Alta",
    progress: 0,
  },
  {
    title: "SEO Páginas",
    description: "Otimizar páginas para SEO",
    pillar: "Google",
    assignee: "SEO Specialist",
    startDate: new Date("2026-08-12"),
    dueDate: new Date("2026-08-25"),
    status: "A Fazer",
    priority: "Alta",
    progress: 0,
  },
  {
    title: "Rastreamento",
    description: "Implementar rastreamento de conversões",
    pillar: "Google",
    assignee: "Analytics Team",
    startDate: new Date("2026-08-20"),
    dueDate: new Date("2026-09-02"),
    status: "A Fazer",
    priority: "Média",
    progress: 0,
  },

  // Redes Sociais
  {
    title: "Organização dos Arquivos (Empresas)",
    description: "Organizar arquivos de redes sociais",
    pillar: "Redes Sociais",
    assignee: "Social Media Team",
    startDate: new Date("2026-07-31"),
    dueDate: new Date("2026-08-08"),
    status: "Em Andamento",
    priority: "Média",
    progress: 50,
  },
  {
    title: "Vídeos Orgânicos",
    description: "Produzir conteúdo de vídeos orgânicos",
    pillar: "Redes Sociais",
    assignee: "Content Creator",
    startDate: new Date("2026-08-02"),
    dueDate: new Date("2026-08-18"),
    status: "Em Andamento",
    priority: "Alta",
    progress: 30,
  },
  {
    title: "Editar GHL - Nível Agência",
    description: "Editar configurações do GoHighLevel",
    pillar: "GoHighLevel",
    assignee: "GHL Specialist",
    startDate: new Date("2026-08-10"),
    dueDate: new Date("2026-08-22"),
    status: "A Fazer",
    priority: "Média",
    progress: 0,
  },

  // GoHighLevel
  {
    title: "Limpeza de TAGs",
    description: "Limpar e organizar tags no GoHighLevel",
    pillar: "GoHighLevel",
    assignee: "GHL Admin",
    startDate: new Date("2026-08-01"),
    dueDate: new Date("2026-08-10"),
    status: "Em Andamento",
    priority: "Média",
    progress: 60,
  },
  {
    title: "Limpeza Métodos de",
    description: "Organizar métodos de comunicação",
    pillar: "GoHighLevel",
    assignee: "GHL Admin",
    startDate: new Date("2026-08-08"),
    dueDate: new Date("2026-08-18"),
    status: "A Fazer",
    priority: "Média",
    progress: 0,
  },
  {
    title: "Limpeza GHL",
    description: "Limpeza geral do sistema GoHighLevel",
    pillar: "GoHighLevel",
    assignee: "GHL Team",
    startDate: new Date("2026-08-15"),
    dueDate: new Date("2026-08-28"),
    status: "A Fazer",
    priority: "Alta",
    progress: 0,
  },

  // Make.com
  {
    title: "Transcrever Vídeo Zoe Divídas",
    description: "Transcrever vídeo para automação",
    pillar: "Make.com",
    assignee: "Automation Team",
    startDate: new Date("2026-08-03"),
    dueDate: new Date("2026-08-12"),
    status: "A Fazer",
    priority: "Média",
    progress: 0,
  },
  {
    title: "Tratamento de Habilidade e Nic",
    description: "Processar dados de habilidades",
    pillar: "Make.com",
    assignee: "Data Team",
    startDate: new Date("2026-08-10"),
    dueDate: new Date("2026-08-22"),
    status: "A Fazer",
    priority: "Média",
    progress: 0,
  },
  {
    title: "Tratamento e Estrutura (Estudo Disney / Resultado)",
    description: "Estruturar dados de estudo",
    pillar: "Make.com",
    assignee: "Analytics Team",
    startDate: new Date("2026-08-15"),
    dueDate: new Date("2026-08-28"),
    status: "A Fazer",
    priority: "Alta",
    progress: 0,
  },

  // Ferramentas Complementares
  {
    title: "Moster o Layout Planejamento Financeiro",
    description: "Apresentar layout de planejamento",
    pillar: "Ferramentas Complementares",
    assignee: "Design Team",
    startDate: new Date("2026-08-18"),
    dueDate: new Date("2026-08-28"),
    status: "A Fazer",
    priority: "Média",
    progress: 0,
  },
  {
    title: "Sistemas Consultivos (Obsidian)",
    description: "Configurar sistema de consultoria",
    pillar: "Ferramentas Complementares",
    assignee: "Knowledge Manager",
    startDate: new Date("2026-08-20"),
    dueDate: new Date("2026-09-02"),
    status: "A Fazer",
    priority: "Média",
    progress: 0,
  },
  {
    title: "Acertos de Anuncios + Resultados",
    description: "Ajustar anúncios e medir resultados",
    pillar: "Ferramentas Complementares",
    assignee: "Ads Manager",
    startDate: new Date("2026-09-01"),
    dueDate: new Date("2026-09-20"),
    status: "A Fazer",
    priority: "Alta",
    progress: 0,
  },
];

const INITIAL_PHASES_TEMPLATE = [
  // Google
  {
    title: "Fase 1: Fundação & SEO Base",
    pillar: "Google",
    description: "Estruturação de funil e otimizações SEO iniciais",
    startDate: new Date("2026-08-01"),
    endDate: new Date("2026-08-15"),
    color: "#F59E0B",
  },
  {
    title: "Fase 2: Execução Funil & Conteúdo",
    pillar: "Google",
    description: "Produção do novo site e criação de páginas otimizadas",
    startDate: new Date("2026-08-16"),
    endDate: new Date("2026-09-15"),
    color: "#F59E0B",
  },
  {
    title: "Fase 3: Rastreamento & Analytics",
    pillar: "Google",
    description: "Implementação de conversões e otimizações",
    startDate: new Date("2026-09-16"),
    endDate: new Date("2026-10-01"),
    color: "#F59E0B",
  },

  // Redes Sociais
  {
    title: "Fase 1: Organização & Ativos",
    pillar: "Redes Sociais",
    description: "Organização de arquivos e assets de mídias sociais",
    startDate: new Date("2026-08-01"),
    endDate: new Date("2026-08-15"),
    color: "#EC4899",
  },
  {
    title: "Fase 2: Produção de Vídeos Orgânicos",
    pillar: "Redes Sociais",
    description: "Gravação e edição de vídeos para engajamento",
    startDate: new Date("2026-08-16"),
    endDate: new Date("2026-09-15"),
    color: "#EC4899",
  },
  {
    title: "Fase 3: Escala & Tráfego Pago",
    pillar: "Redes Sociais",
    description: "Ajustes de público e escala de campanhas",
    startDate: new Date("2026-09-16"),
    endDate: new Date("2026-10-01"),
    color: "#EC4899",
  },

  // GoHighLevel
  {
    title: "Fase 1: Higienização & TAGs",
    pillar: "GoHighLevel",
    description: "Limpeza de tags e organização no CRM",
    startDate: new Date("2026-08-01"),
    endDate: new Date("2026-08-15"),
    color: "#8B5CF6",
  },
  {
    title: "Fase 2: Comunicação & Nível Agência",
    pillar: "GoHighLevel",
    description: "Ajuste de métodos e configurações agência",
    startDate: new Date("2026-08-16"),
    endDate: new Date("2026-09-15"),
    color: "#8B5CF6",
  },
  {
    title: "Fase 3: Automação Total GHL",
    pillar: "GoHighLevel",
    description: "Fluxos de nutrição e otimização de pipeline",
    startDate: new Date("2026-09-16"),
    endDate: new Date("2026-10-01"),
    color: "#8B5CF6",
  },

  // Make.com
  {
    title: "Fase 1: Transcrição & Processamento",
    pillar: "Make.com",
    description: "Automação de transcrição e recebimento de dados",
    startDate: new Date("2026-08-01"),
    endDate: new Date("2026-08-15"),
    color: "#3B82F6",
  },
  {
    title: "Fase 2: Tratamento de Habilidade & Nic",
    pillar: "Make.com",
    description: "Estruturação de dados e regras no Make",
    startDate: new Date("2026-08-16"),
    endDate: new Date("2026-09-15"),
    color: "#3B82F6",
  },
  {
    title: "Fase 3: Scenarios & Estudo Resultados",
    pillar: "Make.com",
    description: "Extração de relatórios automatizados",
    startDate: new Date("2026-09-16"),
    endDate: new Date("2026-10-01"),
    color: "#3B82F6",
  },

  // Ferramentas Complementares
  {
    title: "Fase 1: Layout Planejamento Financeiro",
    pillar: "Ferramentas Complementares",
    description: "Desenvolvimento de dashboards e modelos",
    startDate: new Date("2026-08-01"),
    endDate: new Date("2026-08-15"),
    color: "#10B981",
  },
  {
    title: "Fase 2: Sistemas Consultivos Obsidian",
    pillar: "Ferramentas Complementares",
    description: "Configuração da base de conhecimento",
    startDate: new Date("2026-08-16"),
    endDate: new Date("2026-09-15"),
    color: "#10B981",
  },
  {
    title: "Fase 3: Acertos de Anúncios & Métricas",
    pillar: "Ferramentas Complementares",
    description: "Consolidação de relatórios e otimizações",
    startDate: new Date("2026-09-16"),
    endDate: new Date("2026-10-01"),
    color: "#10B981",
  },
];

export async function seedDatabase(userId: number) {
  try {
    const existingPhases = await getUserPhases(userId);
    if (existingPhases.length === 0) {
      // Insert phases
      for (const phase of INITIAL_PHASES_TEMPLATE) {
        await createPhase({
          userId,
          title: phase.title,
          pillar: phase.pillar as any,
          description: phase.description,
          startDate: phase.startDate,
          endDate: phase.endDate,
          color: phase.color,
        });
      }
    }

    const existingTasks = await getUserTasks(userId);
    if (existingTasks.length === 0) {
      // Insert tasks
      for (const task of INITIAL_TASKS_TEMPLATE) {
        await createTask({
          userId,
          title: task.title,
          description: task.description,
          pillar: task.pillar as any,
          assignee: task.assignee,
          startDate: task.startDate,
          dueDate: task.dueDate,
          status: task.status as any,
          priority: task.priority as any,
          progress: task.progress,
        });
      }
    }

    console.log("✅ Database seeded successfully for user", userId);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}
