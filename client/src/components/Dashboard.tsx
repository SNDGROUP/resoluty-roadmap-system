import { useMemo } from "react";
import { Task, Phase, Pillar } from "@/types/roadmap";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardProps {
  tasks: Task[];
  phases: Phase[];
}

const PILLAR_COLORS: Record<Pillar, string> = {
  "Google": "#FCD34D",
  "Redes Sociais": "#F472B6",
  "GoHighLevel": "#A78BFA",
  "Make.com": "#60A5FA",
  "Ferramentas Complementares": "#4ADE80",
};

export default function Dashboard({ tasks, phases }: DashboardProps) {
  // Calculate metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === "Em Andamento").length;
    const completed = tasks.filter(t => t.status === "Concluído").length;
    const delayed = tasks.filter(t => t.status === "Atrasado").length;
    const avgProgress = total > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total) : 0;

    return { total, inProgress, completed, delayed, avgProgress };
  }, [tasks]);

  // Tasks by pillar
  const tasksByPillar = useMemo(() => {
    const pillars: Pillar[] = [
      "Google",
      "Redes Sociais",
      "GoHighLevel",
      "Make.com",
      "Ferramentas Complementares",
    ];

    return pillars.map(pillar => ({
      name: pillar,
      total: tasks.filter(t => t.pillar === pillar).length,
      completed: tasks.filter(t => t.pillar === pillar && t.status === "Concluído").length,
      inProgress: tasks.filter(t => t.pillar === pillar && t.status === "Em Andamento").length,
    }));
  }, [tasks]);

  // Tasks by status
  const tasksByStatus = useMemo(() => {
    return [
      { name: "A Fazer", value: tasks.filter(t => t.status === "A Fazer").length, fill: "#D1D5DB" },
      { name: "Em Andamento", value: tasks.filter(t => t.status === "Em Andamento").length, fill: "#3B82F6" },
      { name: "Concluído", value: tasks.filter(t => t.status === "Concluído").length, fill: "#10B981" },
      { name: "Atrasado", value: tasks.filter(t => t.status === "Atrasado").length, fill: "#EF4444" },
    ];
  }, [tasks]);

  // Tasks by priority
  const tasksByPriority = useMemo(() => {
    return [
      { name: "Baixa", value: tasks.filter(t => t.priority === "Baixa").length },
      { name: "Média", value: tasks.filter(t => t.priority === "Média").length },
      { name: "Alta", value: tasks.filter(t => t.priority === "Alta").length },
      { name: "Crítica", value: tasks.filter(t => t.priority === "Crítica").length },
    ];
  }, [tasks]);

  // Upcoming tasks
  const upcomingTasks = useMemo(() => {
    const now = new Date();
    return tasks
      .filter(t => new Date(t.dueDate) > now && t.status !== "Concluído")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metrics.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{metrics.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metrics.completed}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metrics.delayed}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progresso Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{metrics.avgProgress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Pillar */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Tarefas por Pilar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tasksByPillar}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#1A237E" name="Total" />
                <Bar dataKey="completed" fill="#10B981" name="Concluído" />
                <Bar dataKey="inProgress" fill="#3B82F6" name="Em Andamento" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tasks by Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tasks by Priority */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Tarefas por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar dataKey="value" fill="#FF6D00" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Próximas Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma tarefa próxima</p>
              ) : (
                upcomingTasks.map(task => (
                  <div key={task.id} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm text-foreground truncate">{task.title}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">{task.pillar}</span>
                      <span className="text-xs text-accent font-semibold">
                        {format(new Date(task.dueDate), "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
