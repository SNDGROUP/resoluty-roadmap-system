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
import { useDatabase } from "@/contexts/DatabaseContext";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import HelpTooltip from "@/components/HelpTooltip";

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
  const { pillars } = usePillars();
  const { supabase, isConfigured } = useDatabase();

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
      toast.success("Tarefa salva com sucesso no roadmap!");
      onTaskCreated();
      resetForm();
    },
    onError: (err) => {
      console.error("TRPC Create Error", err);
      toast.error("Erro ao salvar tarefa. Verifique os campos.");
    }
  });

  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("Tarefa atualizada com sucesso!");
      onTaskCreated();
      resetForm();
    },
    onError: (err) => {
      console.error("TRPC Update Error", err);
      toast.error("Erro ao atualizar tarefa.");
    }
  });

  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa excluída com sucesso.");
      onTaskCreated();
      onOpenChange(false);
      resetForm();
    },
    onError: (err) => {
      console.error("TRPC Delete Error", err);
      toast.error("Erro ao excluir tarefa.");
    }
  });

  const handleDeleteTask = async () => {
    if (!editingTask) return;
    if (isConfigured) {
      try {
        await supabase.from("tasks").delete().eq("id", editingTask.id);
      } catch (err) {
        console.warn("[Supabase Task Delete fallback]", err);
      }
    }
    deleteTaskMutation.mutate({ id: editingTask.id });
  };

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

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Por favor, preencha o título da tarefa");
      return;
    }

    // Direct Supabase sync if configured
    if (isConfigured) {
      try {
        if (editingTask) {
          await supabase.from("tasks").update({
            title: formData.title,
            description: formData.description || null,
            pillar: formData.pillar,
            assignee: formData.assignee || null,
            start_date: new Date(formData.startDate).toISOString(),
            due_date: new Date(formData.dueDate).toISOString(),
            status: formData.status,
            priority: formData.priority,
            progress: formData.progress,
          }).eq("id", editingTask.id);
        } else {
          await supabase.from("tasks").insert([{
            title: formData.title,
            description: formData.description || null,
            pillar: formData.pillar,
            assignee: formData.assignee || null,
            start_date: new Date(formData.startDate).toISOString(),
            due_date: new Date(formData.dueDate).toISOString(),
            status: formData.status,
            priority: formData.priority,
            progress: formData.progress,
          }]);
        }
      } catch (err) {
        console.warn("[Supabase Task Sync fallback]", err);
      }
    }

    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        title: formData.title,
        description: formData.description || undefined,
        pillar: formData.pillar as any,
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
        pillar: formData.pillar as any,
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
      <DialogContent className="max-w-2xl bg-background text-foreground border-2 border-border shadow-2xl opacity-100 z-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center justify-between">
            <span>{editingTask ? "Editar Tarefa" : "Nova Tarefa no Roadmap"}</span>
            <HelpTooltip
              title="Formulário de Tarefa"
              description="Preencha os detalhes da entrega para atualizar o roadmap e os relatórios em tempo real."
              steps={[
                "Título e Pilar Estratégico são obrigatórios.",
                "Especifique o Responsável para atribuição clara.",
                "Ajuste a Data de Início e Término para posicionar corretamente a barra no gráfico de Gantt.",
                "O Slider de Progresso (0 a 100%) atualiza automaticamente a porcentagem dos pilares.",
              ]}
              size="sm"
            />
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
              className="bg-background text-foreground border-border"
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
              className="bg-background text-foreground border-border"
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
              <SelectTrigger id="pillar" className="bg-background text-foreground border-border">
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
              className="bg-background text-foreground border-border"
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
                className="bg-background text-foreground border-border"
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
                className="bg-background text-foreground border-border"
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
                <SelectTrigger id="status" className="bg-background text-foreground border-border">
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
                <SelectTrigger id="priority" className="bg-background text-foreground border-border">
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

        <DialogFooter className="pt-2 border-t border-border mt-4 flex items-center justify-between gap-2">
          {editingTask ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={deleteTaskMutation.isPending || createTaskMutation.isPending || updateTaskMutation.isPending}
              className="gap-1.5 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleteTaskMutation.isPending ? "Excluindo..." : "Excluir Tarefa"}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createTaskMutation.isPending || updateTaskMutation.isPending || deleteTaskMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              {createTaskMutation.isPending || updateTaskMutation.isPending
                ? "Salvando..."
                : editingTask
                ? "Atualizar Tarefa"
                : "Criar Tarefa"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
