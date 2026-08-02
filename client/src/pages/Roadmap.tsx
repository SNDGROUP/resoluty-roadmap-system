import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import RoadmapTimeline from "@/components/RoadmapTimeline";
import Dashboard from "@/components/Dashboard";
import TasksTable from "@/components/TasksTable";
import TaskFormDialog from "@/components/TaskFormDialog";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Calendar, Table as TableIcon } from "lucide-react";
import { Task, Phase } from "@/types/roadmap";

export default function Roadmap() {
  const [activeTab, setActiveTab] = useState<"timeline" | "dashboard" | "table">("timeline");
  const [viewMode, setViewMode] = useState<"week" | "month" | "quarter">("month");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [filterPillar, setFilterPillar] = useState<string[]>([]);

  const tasksQuery = trpc.tasks.list.useQuery({
    status: filterStatus.length > 0 ? filterStatus : undefined,
    priority: filterPriority.length > 0 ? filterPriority : undefined,
    pillar: filterPillar.length > 0 ? filterPillar : undefined,
  });

  const phasesQuery = trpc.phases.list.useQuery();

  const tasks: Task[] = (tasksQuery.data as any[]) || [];
  const phases: Phase[] = (phasesQuery.data as any[]) || [];

  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskSuccess = () => {
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
            <h1 className="text-2xl font-bold text-foreground">Resoluty Roadmap System</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhamento estratégico de pilares, fases e tarefas
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
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("dashboard")}
                className="gap-2 text-xs h-8"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Dashboard
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

            <Button onClick={handleCreateTask} size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-white">
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Content View */}
        {tasksQuery.isLoading ? (
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
                onTaskUpdate={() => tasksQuery.refetch()}
                onTaskEdit={handleEditTask}
              />
            )}

            {activeTab === "dashboard" && (
              <Dashboard tasks={tasks} phases={phases} />
            )}

            {activeTab === "table" && (
              <TasksTable
                tasks={tasks}
                onTaskUpdate={() => tasksQuery.refetch()}
                onTaskDelete={() => tasksQuery.refetch()}
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
