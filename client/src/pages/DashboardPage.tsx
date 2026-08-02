import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { usePillars } from "@/contexts/PillarContext";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Layers,
  Calendar,
  Sparkles,
  RefreshCw,
  Users,
  Target,
  Search,
} from "lucide-react";

export default function DashboardPage() {
  const { data: tasks = [], isLoading, refetch } = trpc.tasks.list.useQuery();
  const { pillars, getPillarColor } = usePillars();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return tasks;
    const term = searchTerm.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.pillar.toLowerCase().includes(term) ||
        (t.assignee && t.assignee.toLowerCase().includes(term))
    );
  }, [tasks, searchTerm]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = filteredTasks.length;
    const inProgress = filteredTasks.filter((t) => t.status === "Em Andamento").length;
    const completed = filteredTasks.filter((t) => t.status === "Concluído").length;
    const delayed = filteredTasks.filter((t) => t.status === "Atrasado").length;
    const pending = filteredTasks.filter((t) => t.status === "A Fazer").length;

    const avgProgress =
      total > 0
        ? Math.round(filteredTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / total)
        : 0;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, inProgress, completed, delayed, pending, avgProgress, completionRate };
  }, [filteredTasks]);

  // Tasks grouped by dynamic pillars
  const tasksByPillarData = useMemo(() => {
    return pillars.map((p) => {
      const pillarTasks = filteredTasks.filter((t) => t.pillar === p.name);
      return {
        name: p.name,
        total: pillarTasks.length,
        completed: pillarTasks.filter((t) => t.status === "Concluído").length,
        inProgress: pillarTasks.filter((t) => t.status === "Em Andamento").length,
        delayed: pillarTasks.filter((t) => t.status === "Atrasado").length,
        color: p.color,
      };
    });
  }, [pillars, filteredTasks]);

  // Status breakdown
  const statusData = useMemo(() => {
    return [
      { name: "Concluído", value: metrics.completed, fill: "#10B981" },
      { name: "Em Andamento", value: metrics.inProgress, fill: "#3B82F6" },
      { name: "A Fazer", value: metrics.pending, fill: "#9CA3AF" },
      { name: "Atrasado", value: metrics.delayed, fill: "#EF4444" },
    ];
  }, [metrics]);

  // Priority breakdown
  const priorityData = useMemo(() => {
    return [
      { name: "Baixa", value: filteredTasks.filter((t) => t.priority === "Baixa").length, fill: "#9CA3AF" },
      { name: "Média", value: filteredTasks.filter((t) => t.priority === "Média").length, fill: "#F59E0B" },
      { name: "Alta", value: filteredTasks.filter((t) => t.priority === "Alta").length, fill: "#F97316" },
      { name: "Crítica", value: filteredTasks.filter((t) => t.priority === "Crítica").length, fill: "#EF4444" },
    ];
  }, [filteredTasks]);

  // Critical / Upcoming Deliverables
  const criticalUpcoming = useMemo(() => {
    return [...filteredTasks]
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 6);
  }, [filteredTasks]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Dashboard Executivo & KPIs
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Visão consolidada de desempenho, progresso dos pilares e status das entregas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar indicador ou entrega..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-9 bg-background text-foreground border-border"
              />
            </div>

            <Badge variant="outline" className="px-3 py-1 font-mono text-xs border-primary/30 text-primary bg-primary/5 hidden sm:flex">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Taxa de Conclusão: {metrics.completionRate}%
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-1.5 text-xs h-9"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Top 5 Key Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Total de Entregas
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{metrics.total}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Cadastradas no sistema</p>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <Target className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Em Andamento
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {metrics.inProgress}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Em execução ativa</p>
              </div>
              <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-500">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Concluídas
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {metrics.completed}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Entregues com sucesso</p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Atrasadas
                </p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {metrics.delayed}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Necessitam atenção</p>
              </div>
              <div className="p-2.5 bg-rose-500/10 rounded-lg text-rose-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Progresso Médio
                </p>
                <p className="text-2xl font-bold text-primary mt-1">{metrics.avgProgress}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Média ponderada</p>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pillar Health Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Saúde dos Pilares Estratégicos
            </h3>
            <span className="text-xs text-muted-foreground">
              {pillars.length} pilares ativos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {pillars.map((p) => {
              const pTasks = tasks.filter((t) => t.pillar === p.name);
              const pCompleted = pTasks.filter((t) => t.status === "Concluído").length;
              const pProgress =
                pTasks.length > 0
                  ? Math.round(
                      pTasks.reduce((acc, curr) => acc + (curr.progress || 0), 0) /
                        pTasks.length
                    )
                  : 0;

              return (
                <div
                  key={p.id}
                  className="bg-card p-3.5 rounded-xl border border-border shadow-sm space-y-2.5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="font-bold text-xs truncate text-foreground" title={p.name}>
                        {p.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                      {pTasks.length} tarefas
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                      <span>Progresso</span>
                      <span className="font-mono text-foreground font-bold">{pProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pProgress}%`, backgroundColor: p.color }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                    <span>Concluídas: {pCompleted}/{pTasks.length}</span>
                    <span
                      className={`font-semibold ${
                        pProgress >= 80
                          ? "text-emerald-500"
                          : pProgress >= 40
                          ? "text-blue-500"
                          : "text-amber-500"
                      }`}
                    >
                      {pProgress >= 80 ? "Alta Entrega" : pProgress >= 40 ? "Em Evolução" : "Inicial"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Tasks by Pillar */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">
                Volume & Entregas por Pilar
              </CardTitle>
              <CardDescription className="text-xs">
                Comparativo de tarefas totais, concluídas e em andamento por pilar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={tasksByPillarData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "currentColor" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="total" fill="#3B82F6" name="Total" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10B981" name="Concluídas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inProgress" fill="#F59E0B" name="Em Andamento" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Status Breakdown Donut */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">
                Distribuição de Status
              </CardTitle>
              <CardDescription className="text-xs">
                Proporção atual do estado de execução dos entregáveis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Critical & Upcoming Deliverables Table */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Entregáveis & Prazos da Alta Gestão
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Próximas tarefas ordenadas por data de entrega e prioridade.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {criticalUpcoming.map((task) => {
                const pillarColor = getPillarColor(task.pillar);
                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: pillarColor }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="font-medium">{task.pillar}</span>
                          <span>•</span>
                          <span>Responsável: {task.assignee || "Alta Gestão"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Prazo Meta</p>
                        <p className="text-xs font-mono font-bold text-foreground">
                          {format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>

                      <Badge
                        className={`text-[10px] px-2 py-0.5 ${
                          task.status === "Concluído"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : task.status === "Em Andamento"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : task.status === "Atrasado"
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                        }`}
                      >
                        {task.status}
                      </Badge>

                      <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden hidden md:block">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
