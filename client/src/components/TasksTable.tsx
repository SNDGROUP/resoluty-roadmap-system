import { useState, useMemo } from "react";
import { Task, Status, Priority, Pillar } from "@/types/roadmap";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Copy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TasksTableProps {
  tasks: Task[];
  onTaskUpdate: () => void;
  onTaskDelete: () => void;
  filterStatus?: string[];
  onFilterStatusChange?: (status: string[]) => void;
  filterPriority?: string[];
  onFilterPriorityChange?: (priority: string[]) => void;
  filterPillar?: string[];
  onFilterPillarChange?: (pillar: string[]) => void;
}

const STATUS_COLORS: Record<Status, string> = {
  "A Fazer": "bg-gray-100 text-gray-800",
  "Em Andamento": "bg-blue-100 text-blue-800",
  "Concluído": "bg-green-100 text-green-800",
  "Atrasado": "bg-red-100 text-red-800",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  "Baixa": "bg-gray-100 text-gray-800",
  "Média": "bg-yellow-100 text-yellow-800",
  "Alta": "bg-orange-100 text-orange-800",
  "Crítica": "bg-red-100 text-red-800",
};

export default function TasksTable({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  filterStatus: externalFilterStatus = [],
  onFilterStatusChange,
  filterPriority: externalFilterPriority = [],
  onFilterPriorityChange,
  filterPillar: externalFilterPillar = [],
  onFilterPillarChange,
}: TasksTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use external filters if provided, otherwise use local state
  const filterStatus = externalFilterStatus.length > 0 ? externalFilterStatus : [];
  const filterPriority = externalFilterPriority.length > 0 ? externalFilterPriority : [];
  const filterPillar = externalFilterPillar.length > 0 ? externalFilterPillar : [];
  
  const handleFilterStatusChange = (value: string) => {
    if (value === "todas") {
      onFilterStatusChange?.([]);
    } else if (onFilterStatusChange) {
      const newStatus = filterStatus.includes(value)
        ? filterStatus.filter(s => s !== value)
        : [...filterStatus, value];
      onFilterStatusChange(newStatus);
    }
  };
  
  const handleFilterPriorityChange = (value: string) => {
    if (value === "todas") {
      onFilterPriorityChange?.([]);
    } else if (onFilterPriorityChange) {
      const newPriority = filterPriority.includes(value)
        ? filterPriority.filter(p => p !== value)
        : [...filterPriority, value];
      onFilterPriorityChange(newPriority);
    }
  };
  
  const handleFilterPillarChange = (value: string) => {
    if (value === "todos") {
      onFilterPillarChange?.([]);
    } else if (onFilterPillarChange) {
      const newPillar = filterPillar.includes(value)
        ? filterPillar.filter(pi => pi !== value)
        : [...filterPillar, value];
      onFilterPillarChange(newPillar);
    }
  };

  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: onTaskDelete,
  });

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
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

  const PILLARS: Pillar[] = [
    "Google",
    "Redes Sociais",
    "GoHighLevel",
    "Make.com",
    "Ferramentas Complementares",
  ];

  const STATUSES: Status[] = ["A Fazer", "Em Andamento", "Concluído", "Atrasado"];
  const PRIORITIES: Priority[] = ["Baixa", "Média", "Alta", "Crítica"];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-card p-4 rounded-lg border border-border">
        <Input
          placeholder="Buscar tarefa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="col-span-1 md:col-span-2"
        />
        
        <Select value={filterStatus.length > 0 ? filterStatus[0] : "todas"} onValueChange={(v) => handleFilterStatusChange(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos os Status</SelectItem>
            {STATUSES.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPriority.length > 0 ? filterPriority[0] : "todas"} onValueChange={(v) => handleFilterPriorityChange(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as Prioridades</SelectItem>
            {PRIORITIES.map(priority => (
              <SelectItem key={priority} value={priority}>{priority}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPillar.length > 0 ? filterPillar[0] : "todos"} onValueChange={(v) => handleFilterPillarChange(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Pilares</SelectItem>
            {PILLARS.map(pillar => (
              <SelectItem key={pillar} value={pillar}>{pillar}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="text-foreground font-bold">Tarefa</TableHead>
              <TableHead className="text-foreground font-bold">Pilar</TableHead>
              <TableHead className="text-foreground font-bold">Responsável</TableHead>
              <TableHead className="text-foreground font-bold">Data Início</TableHead>
              <TableHead className="text-foreground font-bold">Data Meta</TableHead>
              <TableHead className="text-foreground font-bold">Status</TableHead>
              <TableHead className="text-foreground font-bold">Prioridade</TableHead>
              <TableHead className="text-foreground font-bold">Progresso</TableHead>
              <TableHead className="text-foreground font-bold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhuma tarefa encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map(task => (
                <TableRow key={task.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">{task.title}</TableCell>
                  <TableCell className="text-sm text-foreground">{task.pillar}</TableCell>
                  <TableCell className="text-sm text-foreground">{task.assignee || "-"}</TableCell>
                  <TableCell className="text-sm text-foreground">
                    {format(new Date(task.startDate), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[task.status]}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={PRIORITY_COLORS[task.priority]}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className="bg-accent h-full rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs">{task.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleDelete(task.id)}
                        disabled={deleteTaskMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total de Tarefas</p>
          <p className="text-2xl font-bold text-foreground">{filteredTasks.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Em Andamento</p>
          <p className="text-2xl font-bold text-blue-600">{filteredTasks.filter(t => t.status === "Em Andamento").length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Concluídas</p>
          <p className="text-2xl font-bold text-green-600">{filteredTasks.filter(t => t.status === "Concluído").length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Atrasadas</p>
          <p className="text-2xl font-bold text-red-600">{filteredTasks.filter(t => t.status === "Atrasado").length}</p>
        </div>
      </div>
    </div>
  );
}
