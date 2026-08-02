import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Status, Priority, Task } from "@/types/roadmap";
import { usePillars } from "@/contexts/PillarContext";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
  editingTask?: Task | null;
  initialPillar?: string;
}

const STATUSES: Status[] = ["A Fazer", "Em Andamento", "Concluído", "Atrasado"];
const PRIORITIES: Priority[] = ["Baixa", "Média", "Alta", "Crítica"];

export default function TaskFormDialog({
  open,
  onOpenChange,
  onTaskCreated,
  editingTask,
  initialPillar,
}: TaskFormDialogProps) {
  const { pillars, getPillarColor } = usePillars();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pillar: initialPillar || pillars[0]?.name || "Google",
    assignee: "",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    status: "A Fazer" as Status,
    priority: "Média" as Priority,
    progress: 0,
  });

  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      onTaskCreated();
      resetForm();
    },
  });

  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      onTaskCreated();
      resetForm();
    },
  });

  useEffect(() => {
    if (editingTask && open) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || "",
        pillar: editingTask.pillar || pillars[0]?.name || "Google",
        assignee: editingTask.assignee || "",
        startDate: new Date(editingTask.startDate).toISOString().split("T")[0],
        dueDate: new Date(editingTask.dueDate).toISOString().split("T")[0],
        status: editingTask.status,
        priority: editingTask.priority,
        progress: editingTask.progress,
      });
    } else if (!editingTask && open) {
      resetForm();
    }
  }, [editingTask, open]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      pillar: initialPillar || pillars[0]?.name || "Google",
      assignee: "",
      startDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      status: "A Fazer",
      priority: "Média",
      progress: 0,
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert("Por favor, preencha o título da tarefa");
      return;
    }

    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        title: formData.title,
        description: formData.description || undefined,
        pillar: formData.pillar,
        assignee: formData.assignee || undefined,
        startDate: new Date(formData.startDate),
        dueDate: new Date(formData.dueDate),
        status: formData.status,
        priority: formData.priority,
        progress: formData.progress,
      });
    } else {
      createTaskMutation.mutate({
        title: formData.title,
        description: formData.description || undefined,
        pillar: formData.pillar,
        assignee: formData.assignee || undefined,
        startDate: new Date(formData.startDate),
        dueDate: new Date(formData.dueDate),
        status: formData.status,
        priority: formData.priority,
        progress: formData.progress,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 shadow-2xl opacity-100 z-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            {editingTask ? "Editar Tarefa" : "Nova Tarefa no Roadmap"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Título *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Digite o título da tarefa ou marco"
              className="bg-background"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes, entregáveis ou notas de execução..."
              rows={3}
              className="bg-background"
            />
          </div>

          {/* Pillar */}
          <div className="space-y-2">
            <Label htmlFor="pillar" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Pilar Estratégico *
            </Label>
            <Select
              value={formData.pillar}
              onValueChange={(value) => setFormData({ ...formData, pillar: value })}
            >
              <SelectTrigger id="pillar" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pillars.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="assignee" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Responsável / Equipe
            </Label>
            <Input
              id="assignee"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              placeholder="Ex: Time de Growth, João Silva"
              className="bg-background"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Data de Início *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Data de Conclusão *
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Status })}
              >
                <SelectTrigger id="status" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Prioridade *
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
              >
                <SelectTrigger id="priority" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Progresso de Execução</span>
              <span className="text-primary font-bold">{formData.progress}%</span>
            </div>
            <Slider
              id="progress"
              min={0}
              max={100}
              step={5}
              value={[formData.progress]}
              onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {createTaskMutation.isPending || updateTaskMutation.isPending
              ? "Salvando..."
              : editingTask
              ? "Atualizar Tarefa"
              : "Criar Tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
