import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { usePillars } from "@/contexts/PillarContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Kanban,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  Layers,
  Filter,
  Trash2,
} from "lucide-react";
import TaskFormDialog from "@/components/TaskFormDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import HelpTooltip from "@/components/HelpTooltip";

type Status = "A Fazer" | "Em Andamento" | "Concluído" | "Atrasado";

const COLUMNS: { id: Status; label: string; icon: any; color: string; bgColor: string }[] = [
  {
    id: "A Fazer",
    label: "A Fazer",
    icon: Clock,
    color: "text-slate-600 dark:text-slate-300",
    bgColor: "bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700",
  },
  {
    id: "Em Andamento",
    label: "Em Andamento",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50",
  },
  {
    id: "Concluído",
    label: "Concluído",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50",
  },
  {
    id: "Atrasado",
    label: "Atrasado",
    icon: AlertTriangle,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50",
  },
];

export default function KanbanPage() {
  const { data: tasks = [], refetch } = trpc.tasks.list.useQuery();
  const { pillars, getPillarColor } = usePillars();
  const updateTaskMutation = trpc.tasks.update.useMutation();
  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDeleteTask = async (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTaskMutation.mutateAsync({ id: taskId });
      refetch();
    } catch (err) {
      console.error("Erro ao deletar tarefa no Kanban:", err);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<string>("TODOS");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [initialColumnStatus, setInitialColumnStatus] = useState<Status | undefined>(undefined);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        !searchTerm.trim() ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.assignee && t.assignee.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesPillar = selectedPillar === "TODOS" || t.pillar === selectedPillar;

      return matchesSearch && matchesPillar;
    });
  }, [tasks, searchTerm, selectedPillar]);

  const handleStatusChange = async (taskId: number, newStatus: Status) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        status: newStatus,
        progress: newStatus === "Concluído" ? 100 : newStatus === "A Fazer" ? 0 : undefined,
      });
      refetch();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const handleOpenNewTask = (status?: Status) => {
    setEditingTask(null);
    setInitialColumnStatus(status);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Kanban className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                Quadro Kanban de Tarefas
                <HelpTooltip
                  title="Quadro Kanban"
                  description="Gestão visual no estilo Agile/Trello para mover cartões entre etapas de execução."
                  steps={[
                    "Clique no botão 'Mover para' em qualquer cartão para mudar seu status instantaneamente.",
                    "Use a barra de busca ou o seletor de Pilares para filtrar as atividades.",
                    "Clique no cartão para abrir a edição completa de prazos, responsabilidade e progresso.",
                  ]}
                />
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gerencie a execução dos entregáveis por colunas de status de forma ágil.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar cartão..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-9 bg-background text-foreground border-border"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={selectedPillar}
                onChange={(e) => setSelectedPillar(e.target.value)}
                className="text-xs h-9 px-3 rounded-md bg-background text-foreground border border-border font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="TODOS">Todos os Pilares</option>
                {pillars.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => handleOpenNewTask("A Fazer")}
              className="gap-1.5 text-xs h-9 font-semibold bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4" /> Novo Cartão
            </Button>
          </div>
        </div>

        {/* Kanban Board Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const ColumnIcon = col.icon;
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-xl border ${col.bgColor} p-3.5 min-h-[600px] shadow-sm`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ColumnIcon className={`w-4 h-4 ${col.color}`} />
                    <h2 className="font-bold text-sm text-foreground">
                      {col.label}
                    </h2>
                    <Badge variant="secondary" className="font-mono text-[11px] px-2 py-0.5 font-bold">
                      {colTasks.length}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenNewTask(col.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title={`Adicionar cartão em ${col.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Task Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="p-4 text-center rounded-lg border border-dashed border-border text-xs text-muted-foreground bg-background/50">
                      Nenhum cartão nesta coluna
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const pillarColor = getPillarColor(task.pillar);

                      return (
                        <div
                          key={task.id}
                          onClick={() => handleEditTask(task)}
                          className="bg-card p-3.5 rounded-lg border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer space-y-2.5 group"
                        >
                          {/* Top Tag & Pillar */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs truncate"
                              style={{ backgroundColor: pillarColor }}
                            >
                              <Layers className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{task.pillar}</span>
                            </span>

                            <div className="flex items-center gap-1">
                              <Badge
                                className={`text-[9px] px-1.5 py-0 font-medium ${
                                  task.priority === "Crítica"
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900"
                                    : task.priority === "Alta"
                                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900"
                                    : task.priority === "Média"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                                    : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                                }`}
                              >
                                {task.priority}
                              </Badge>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteTask(task.id, e)}
                                className="p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100"
                                title="Excluir cartão"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Task Title */}
                          <p className="font-semibold text-xs text-foreground leading-snug group-hover:text-primary transition-colors">
                            {task.title}
                          </p>

                          {task.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Progress Bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                              <span>Progresso</span>
                              <span className="font-bold text-foreground">
                                {task.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${task.progress}%`,
                                  backgroundColor: pillarColor,
                                }}
                              />
                            </div>
                          </div>

                          {/* Footer Card Info */}
                          <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1.5 truncate">
                              <Users className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{task.assignee || "Sem responsável"}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 font-mono">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span>{format(new Date(task.dueDate), "dd/MM", { locale: ptBR })}</span>
                            </div>
                          </div>

                          {/* Move Quick Actions */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-1.5 flex items-center justify-between gap-1 text-[10px] opacity-80 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="text-[9px] text-muted-foreground">Mover para:</span>
                            <div className="flex items-center gap-1">
                              {COLUMNS.filter((c) => c.id !== task.status).map((c) => (
                                <button
                                  key={c.id}
                                  onClick={() => handleStatusChange(task.id, c.id)}
                                  className="px-1.5 py-0.5 rounded bg-muted hover:bg-primary hover:text-white text-foreground font-medium transition-colors"
                                  title={`Mover para ${c.label}`}
                                >
                                  {c.label === "A Fazer"
                                    ? "Fazer"
                                    : c.label === "Em Andamento"
                                    ? "Andamento"
                                    : c.label === "Concluído"
                                    ? "Concluído"
                                    : "Atrasado"}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TaskFormDialog
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        onTaskCreated={() => refetch()}
        editingTask={editingTask}
      />
    </DashboardLayout>
  );
}
