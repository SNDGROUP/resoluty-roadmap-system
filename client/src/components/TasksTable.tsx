import { useState, useMemo } from "react";
import { Task, Status, Priority } from "@/types/roadmap";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Copy, Search, CheckCircle2, Clock, AlertTriangle, ListTodo } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePillars } from "@/contexts/PillarContext";

interface TasksTableProps {
  tasks: Task[];
  onTaskUpdate: () => void;
  onTaskDelete: () => void;
  onTaskEdit?: (task: Task) => void;
  filterStatus?: string[];
  onFilterStatusChange?: (status: string[]) => void;
  filterPriority?: string[];
  onFilterPriorityChange?: (priority: string[]) => void;
  filterPillar?: string[];
  onFilterPillarChange?: (pillar: string[]) => void;
}

const STATUS_COLORS: Record<Status, string> = {
  "A Fazer": "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300",
  "Em Andamento": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-300",
  "Concluído": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300",
  "Atrasado": "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  "Baixa": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "Média": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  "Alta": "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  "Crítica": "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 font-bold",
};

export default function TasksTable({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  filterStatus: externalFilterStatus = [],
  onFilterStatusChange,
  filterPriority: externalFilterPriority = [],
  onFilterPriorityChange,
  filterPillar: externalFilterPillar = [],
  onFilterPillarChange,
}: TasksTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { pillars, getPillarColor } = usePillars();

  const filterStatus = externalFilterStatus.length > 0 ? externalFilterStatus : [];
  const filterPriority = externalFilterPriority.length > 0 ? externalFilterPriority : [];
  const filterPillar = externalFilterPillar.length > 0 ? externalFilterPillar : [];

  const handleFilterStatusChange = (value: string) => {
    if (value === "todas") {
      onFilterStatusChange?.([]);
    } else if (onFilterStatusChange) {
      onFilterStatusChange([value]);
    }
  };

  const handleFilterPriorityChange = (value: string) => {
    if (value === "todas") {
      onFilterPriorityChange?.([]);
    } else if (onFilterPriorityChange) {
      onFilterPriorityChange([value]);
    }
  };

  const handleFilterPillarChange = (value: string) => {
    if (value === "todos") {
      onFilterPillarChange?.([]);
    } else if (onFilterPillarChange) {
      onFilterPillarChange([value]);
    }
  };

  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: onTaskDelete,
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.assignee && task.assignee.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus.length === 0 || filterStatus.includes(task.status);
      const matchesPriority = filterPriority.length === 0 || filterPriority.includes(task.priority);
      const matchesPillar = filterPillar.length === 0 || filterPillar.includes(task.pillar);

      return matchesSearch && matchesStatus && matchesPriority && matchesPillar;
    });
  }, [tasks, searchTerm, filterStatus, filterPriority, filterPillar]);

  const handleDelete = (taskId: number) => {
    if (confirm("Tem certeza que deseja deletar esta tarefa?")) {
      deleteTaskMutation.mutate({ id: taskId });
    }
  };

  const STATUSES: Status[] = ["A Fazer", "Em Andamento", "Concluído", "Atrasado"];
  const PRIORITIES: Priority[] = ["Baixa", "Média", "Alta", "Crítica"];

  // Metrics for Top Row
  const totalCount = filteredTasks.length;
  const inProgressCount = filteredTasks.filter((t) => t.status === "Em Andamento").length;
  const completedCount = filteredTasks.filter((t) => t.status === "Concluído").length;
  const delayedCount = filteredTasks.filter((t) => t.status === "Atrasado").length;

  return (
    <div className="space-y-6">
      {/* 1. TOP METRICS SUMMARY ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total de Tarefas
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Em Andamento
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {inProgressCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Concluídas
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {completedCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Atrasadas
            </p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {delayedCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTERS BAR */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
            <Select
              value={filterStatus.length > 0 ? filterStatus[0] : "todas"}
              onValueChange={handleFilterStatusChange}
            >
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos os Status</SelectItem>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterPriority.length > 0 ? filterPriority[0] : "todas"}
              onValueChange={handleFilterPriorityChange}
            >
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Prioridades</SelectItem>
                {PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterPillar.length > 0 ? filterPillar[0] : "todos"}
              onValueChange={handleFilterPillarChange}
            >
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Pilar Estratégico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Pilares</SelectItem>
                {pillars.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 3. TASKS EXECUTIVE TABLE */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead className="text-foreground font-bold text-xs uppercase">Tarefa</TableHead>
              <TableHead className="text-foreground font-bold text-xs uppercase">Pilar Estratégico</TableHead>
              <TableHead className="text-foreground font-bold text-xs uppercase">Responsável</TableHead>
              <TableHead className="text-foreground font-bold text-xs uppercase">Início</TableHead>
              <TableHead className="text-foreground font-bold text-xs uppercase">Entrega</TableHead>
              <TableHead className="text-foreground font-bold text-xs uppercase">Status</TableHead>
              <TableHead className="text-foreground font-bold text-xs uppercase">Prioridade</TableHead>
              <TableHead className="text-foreground font-bold text-xs uppercase">Progresso</TableHead>
              <TableHead className="text-foreground font-bold text-xs uppercase text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                  Nenhuma tarefa encontrada para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => {
                const pillarColor = getPillarColor(task.pillar);
                return (
                  <TableRow key={task.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-semibold text-foreground text-xs">
                      {task.title}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: pillarColor }}
                        />
                        <span className="font-medium text-foreground">{task.pillar}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {task.assignee || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {format(new Date(task.startDate), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] px-2 py-0.5 border ${STATUS_COLORS[task.status]}`}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] px-2 py-0.5 ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2 min-w-[90px]">
                        <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {task.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onTaskEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onTaskEdit(task)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Editar tarefa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(task.id)}
                          disabled={deleteTaskMutation.isPending}
                          title="Excluir tarefa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
