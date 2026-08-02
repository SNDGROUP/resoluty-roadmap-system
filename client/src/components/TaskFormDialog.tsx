import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Pillar, Status, Priority, Task } from "@/types/roadmap";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
  editingTask?: Task | null;
}

const PILLARS: Pillar[] = [
  "Google",
  "Redes Sociais",
  "GoHighLevel",
  "Make.com",
  "Ferramentas Complementares",
];

const STATUSES: Status[] = ["A Fazer", "Em Andamento", "Concluído", "Atrasado"];
const PRIORITIES: Priority[] = ["Baixa", "Média", "Alta", "Crítica"];

export default function TaskFormDialog({
  open,
  onOpenChange,
  onTaskCreated,
  editingTask,
}: TaskFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pillar: "Google" as Pillar,
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
        pillar: editingTask.pillar,
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
      pillar: "Google",
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Digite o título da tarefa"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Digite a descrição da tarefa"
              rows={3}
            />
          </div>

          {/* Pillar */}
          <div className="space-y-2">
            <Label htmlFor="pillar">Pilar Estratégico *</Label>
            <Select value={formData.pillar} onValueChange={(value) => setFormData({ ...formData, pillar: value as Pillar })}>
              <SelectTrigger id="pillar">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PILLARS.map((pillar) => (
                  <SelectItem key={pillar} value={pillar}>
                    {pillar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="assignee">Responsável</Label>
            <Input
              id="assignee"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              placeholder="Nome do responsável"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Status })}>
                <SelectTrigger id="status">
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
              <Label htmlFor="priority">Prioridade *</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}>
                <SelectTrigger id="priority">
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
          <div className="space-y-2">
            <Label htmlFor="progress">Progresso: {formData.progress}%</Label>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
            className="bg-accent hover:bg-accent/90"
          >
            {createTaskMutation.isPending || updateTaskMutation.isPending ? "Salvando..." : editingTask ? "Atualizar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
