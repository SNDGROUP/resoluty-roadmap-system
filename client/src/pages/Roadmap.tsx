import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import RoadmapTimeline from "@/components/RoadmapTimeline";
import TasksTable from "@/components/TasksTable";
import TaskFormDialog from "@/components/TaskFormDialog";
import { trpc } from "@/lib/trpc";
import { useDatabase } from "@/contexts/DatabaseContext";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Table as TableIcon, RefreshCw } from "lucide-react";
import { Task, Phase } from "@/types/roadmap";
import HelpTooltip from "@/components/HelpTooltip";

export default function Roadmap() {
  const [activeTab, setActiveTab] = useState<"timeline" | "table">("timeline");
  const [viewMode, setViewMode] = useState<"week" | "month" | "quarter">("month");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [filterPillar, setFilterPillar] = useState<string[]>([]);

  const { supabase, isConfigured } = useDatabase();
  const [supabaseTasks, setSupabaseTasks] = useState<any[]>([]);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(false);

  const tasksQuery = trpc.tasks.list.useQuery({
    status: filterStatus.length > 0 ? filterStatus : undefined,
    priority: filterPriority.length > 0 ? filterPriority : undefined,
    pillar: filterPillar.length > 0 ? filterPillar : undefined,
  });

  const phasesQuery = trpc.phases.list.useQuery();

  // Fetch real task data from Supabase 'tasks' table
  const fetchSupabaseTasks = useCallback(async () => {
    if (!isConfigured) return;
    setIsSupabaseLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.warn("[Supabase Roadmap] Error fetching tasks:", error.message);
      } else if (data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          status: item.status,
          priority: item.priority,
          pillar: item.pillar,
          progress: item.progress ?? 0,
          dueDate: item.due_date || item.dueDate || new Date().toISOString(),
          startDate: item.start_date || item.startDate || new Date().toISOString(),
          assignee: item.assignee || "",
          phaseId: item.phase_id || item.phaseId || null,
        }));
        setSupabaseTasks(mapped);
      }
    } catch (err) {
      console.warn("[Supabase Roadmap] Failed to execute fetch:", err);
    } finally {
      setIsSupabaseLoading(false);
    }
  }, [supabase, isConfigured]);

  useEffect(() => {
    fetchSupabaseTasks();
  }, [fetchSupabaseTasks]);

  // Real-time Postgres change listener for tasks
  useEffect(() => {
    if (!isConfigured) return;

    const channel = supabase
      .channel("public:roadmap-tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          console.log("[Supabase Realtime Roadmap] Task change:", payload);
          fetchSupabaseTasks();
          tasksQuery.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, isConfigured, fetchSupabaseTasks, tasksQuery]);

  const tasks: Task[] = (supabaseTasks.length > 0 ? supabaseTasks : tasksQuery.data as any[]) || [];
  const phases: Phase[] = (phasesQuery.data as any[]) || [];

  const handleManualRefresh = () => {
    fetchSupabaseTasks();
    tasksQuery.refetch();
    phasesQuery.refetch();
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskSuccess = () => {
    fetchSupabaseTasks();
    tasksQuery.refetch();
    phasesQuery.refetch();
    setTaskDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Resoluty Roadmap System</h1>
              <HelpTooltip
                title="Sistema de Roadmap Estratégico"
                description="Visualização executiva das metas e entregáveis da empresa organizados por Linha do Tempo e Tabela Executiva."
                steps={[
                  "Use o seletor 'Linha do Tempo' ou 'Tabela' para alternar a forma de visualização.",
                  "Na Linha do Tempo, alterne entre visões de Semana, Mês ou Trimestre.",
                  "Clique em '+ Nova Tarefa' para incluir novos marcos e associá-los aos pilares estratégicos.",
                  "Para editar ou excluir uma tarefa, utilize os botões de ação da tabela ou clique na tarefa na linha do tempo.",
                ]}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Acompanhamento estratégico de pilares, fases e tarefas em tempo real
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex bg-muted p-1 rounded-md">
              <Button
                variant={activeTab === "timeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("timeline")}
                className="gap-2 text-xs h-8"
              >
                <Calendar className="w-3.5 h-3.5" />
                Linha do Tempo
              </Button>
              <Button
                variant={activeTab === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("table")}
                className="gap-2 text-xs h-8"
              >
                <TableIcon className="w-3.5 h-3.5" />
                Tabela
              </Button>
            </div>

            {activeTab === "timeline" && (
              <div className="flex bg-muted p-1 rounded-md">
                <Button
                  variant={viewMode === "week" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className="text-xs h-8"
                >
                  Semana
                </Button>
                <Button
                  variant={viewMode === "month" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className="text-xs h-8"
                >
                  Mês
                </Button>
                <Button
                  variant={viewMode === "quarter" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("quarter")}
                  className="text-xs h-8"
                >
                  Trimestre
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={tasksQuery.isLoading || isSupabaseLoading}
              className="gap-1.5 text-xs h-8"
              title="Atualizar dados em tempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${tasksQuery.isLoading || isSupabaseLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>

            <Button onClick={handleCreateTask} size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8">
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Content View */}
        {tasksQuery.isLoading && tasks.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-muted-foreground">
            Carregando roadmap...
          </div>
        ) : (
          <>
            {activeTab === "timeline" && (
              <RoadmapTimeline
                tasks={tasks}
                phases={phases}
                viewMode={viewMode}
                onTaskUpdate={handleManualRefresh}
                onTaskEdit={handleEditTask}
              />
            )}

            {activeTab === "table" && (
              <TasksTable
                tasks={tasks}
                onTaskUpdate={handleManualRefresh}
                onTaskDelete={handleManualRefresh}
                onTaskEdit={handleEditTask}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus}
                filterPriority={filterPriority}
                onFilterPriorityChange={setFilterPriority}
                filterPillar={filterPillar}
                onFilterPillarChange={setFilterPillar}
              />
            )}
          </>
        )}

        <TaskFormDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onTaskCreated={handleTaskSuccess}
          editingTask={editingTask}
        />
      </div>
    </DashboardLayout>
  );
}
