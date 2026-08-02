import { useState, useMemo } from "react";
import { Task, Phase } from "@/types/roadmap";
import { format, addDays, startOfWeek, startOfMonth, startOfQuarter, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GripHorizontal, CheckCircle2, Clock, AlertTriangle, Layers } from "lucide-react";
import { usePillars } from "@/contexts/PillarContext";

interface RoadmapTimelineProps {
  tasks: Task[];
  phases: Phase[];
  viewMode: "week" | "month" | "quarter";
  onTaskUpdate: () => void;
  onTaskEdit: (task: Task) => void;
}

const STATUS_INDICATORS: Record<string, { label: string; icon: any; class: string }> = {
  "A Fazer": { label: "A Fazer", icon: Clock, class: "border-gray-400" },
  "Em Andamento": { label: "Em Andamento", icon: Clock, class: "border-blue-500" },
  "Concluído": { label: "Concluído", icon: CheckCircle2, class: "border-green-500" },
  "Atrasado": { label: "Atrasado", icon: AlertTriangle, class: "border-red-500" },
};

export default function RoadmapTimeline({
  tasks,
  phases,
  viewMode,
  onTaskUpdate,
  onTaskEdit,
}: RoadmapTimelineProps) {
  const { pillars, getPillarColor } = usePillars();
  const [draggedTask, setDraggedTask] = useState<number | null>(null);

  // Generate timeline dates
  const timelineData = useMemo(() => {
    const today = new Date();
    const startDate =
      viewMode === "week"
        ? startOfWeek(today, { locale: ptBR })
        : viewMode === "month"
        ? startOfMonth(today)
        : startOfQuarter(today);

    const dates: Date[] = [];
    let current = new Date(startDate);

    const count = viewMode === "week" ? 7 : viewMode === "month" ? 30 : 90;
    for (let i = 0; i < count; i++) {
      dates.push(new Date(current));
      current = addDays(current, 1);
    }

    return dates;
  }, [viewMode]);

  // Group tasks by active pillar
  const tasksByPillar = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    // First initialize for all known pillars
    pillars.forEach((p) => {
      grouped[p.name] = [];
    });

    // Also account for tasks that might have custom pillar names
    tasks.forEach((t) => {
      const pillarName = t.pillar || "Outros";
      if (!grouped[pillarName]) {
        grouped[pillarName] = [];
      }
      grouped[pillarName].push(t);
    });

    // Sort tasks in each pillar by start date
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    });

    return grouped;
  }, [tasks, pillars]);

  // Active pillar list containing all pillars present in state or tasks
  const activePillarList = useMemo(() => {
    const set = new Set<string>();
    pillars.forEach((p) => set.add(p.name));
    tasks.forEach((t) => {
      if (t.pillar) set.add(t.pillar);
    });
    return Array.from(set);
  }, [pillars, tasks]);

  const getTaskPosition = (task: Task) => {
    const startDate = new Date(task.startDate);
    const firstDate = timelineData[0];
    const daysDiff = differenceInDays(startDate, firstDate);
    return Math.max(0, daysDiff);
  };

  const getTaskWidth = (task: Task) => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.dueDate);
    const daysDiff = differenceInDays(endDate, startDate);
    return Math.max(1, daysDiff);
  };

  const CELL_WIDTH = 48;
  const ROW_HEIGHT = 42;

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Timeline Header bar with dates */}
      <div className="overflow-x-auto border-b border-border bg-muted/40">
        <div className="flex min-w-max">
          <div className="w-56 flex-shrink-0 border-r border-border p-3.5 bg-muted/70 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Pilares Estratégicos
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-background text-muted-foreground font-mono">
              {activePillarList.length}
            </span>
          </div>
          <div className="flex" style={{ width: `${timelineData.length * CELL_WIDTH}px` }}>
            {timelineData.map((date, idx) => {
              const isToday =
                format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              return (
                <div
                  key={idx}
                  className={`flex-shrink-0 border-r border-border p-2 text-center text-xs transition-colors ${
                    isToday
                      ? "bg-primary/10 font-bold"
                      : idx % 7 === 0
                      ? "bg-muted/70"
                      : ""
                  }`}
                  style={{ width: `${CELL_WIDTH}px` }}
                >
                  <div
                    className={`font-semibold text-xs ${
                      isToday ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {format(date, "d", { locale: ptBR })}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    {format(date, "EEE", { locale: ptBR }).substring(0, 1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline body with rows */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max">
          {/* Pillar Left Labels Column */}
          <div className="w-56 flex-shrink-0 border-r border-border bg-card/50">
            {activePillarList.map((pillarName) => {
              const color = getPillarColor(pillarName);
              const pTasks = tasksByPillar[pillarName] || [];
              const rowCount = Math.max(1, pTasks.length);

              return (
                <div
                  key={pillarName}
                  className="border-b border-border px-3 py-2 flex items-center justify-between font-semibold text-sm text-foreground hover:bg-muted/30 transition-colors"
                  style={{ height: `${rowCount * ROW_HEIGHT + 16}px` }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate text-xs font-bold" title={pillarName}>
                      {pillarName}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-mono text-muted-foreground">
                    {pTasks.length}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Timeline Grid & Colored Task Blocks */}
          <div
            className="relative"
            style={{ width: `${timelineData.length * CELL_WIDTH}px` }}
          >
            {/* Grid Rows Background */}
            {activePillarList.map((pillarName, pIdx) => {
              const pTasks = tasksByPillar[pillarName] || [];
              const rowCount = Math.max(1, pTasks.length);

              let topOffset = 0;
              for (let i = 0; i < pIdx; i++) {
                const prevCount = Math.max(
                  1,
                  (tasksByPillar[activePillarList[i]] || []).length
                );
                topOffset += prevCount * ROW_HEIGHT + 16;
              }

              const rowHeightTotal = rowCount * ROW_HEIGHT + 16;

              return (
                <div
                  key={`row-grid-${pillarName}`}
                  className="absolute left-0 w-full border-b border-border"
                  style={{
                    top: `${topOffset}px`,
                    height: `${rowHeightTotal}px`,
                  }}
                >
                  {timelineData.map((date, dateIdx) => {
                    const isToday =
                      format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                    return (
                      <div
                        key={dateIdx}
                        className={`absolute top-0 h-full border-r border-border/60 ${
                          isToday
                            ? "bg-primary/5 border-primary/30"
                            : dateIdx % 7 === 0
                            ? "bg-muted/20"
                            : "bg-background/40"
                        }`}
                        style={{
                          left: `${dateIdx * CELL_WIDTH}px`,
                          width: `${CELL_WIDTH}px`,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}

            {/* Task Colored Blocks */}
            {activePillarList.map((pillarName, pIdx) => {
              const pTasks = tasksByPillar[pillarName] || [];
              const pillarColor = getPillarColor(pillarName);

              let topOffset = 0;
              for (let i = 0; i < pIdx; i++) {
                const prevCount = Math.max(
                  1,
                  (tasksByPillar[activePillarList[i]] || []).length
                );
                topOffset += prevCount * ROW_HEIGHT + 16;
              }

              return pTasks.map((task, tIdx) => {
                const position = getTaskPosition(task);
                const width = getTaskWidth(task);

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskEdit(task)}
                    draggable
                    onDragStart={() => setDraggedTask(task.id)}
                    onDragEnd={() => setDraggedTask(null)}
                    className="absolute rounded-md px-2 py-1 text-xs font-semibold cursor-pointer flex items-center justify-between gap-1 group hover:scale-[1.02] hover:shadow-md transition-all z-10 border shadow-sm"
                    style={{
                      left: `${position * CELL_WIDTH}px`,
                      top: `${topOffset + tIdx * ROW_HEIGHT + 8}px`,
                      width: `${Math.max(CELL_WIDTH * 1.5, width * CELL_WIDTH)}px`,
                      height: `${ROW_HEIGHT - 12}px`,
                      backgroundColor: pillarColor,
                      color: "#FFFFFF",
                      borderColor: "rgba(255,255,255,0.3)",
                      opacity: draggedTask === task.id ? 0.6 : 0.95,
                    }}
                    title={`${task.title} - Status: ${task.status} (${task.progress}%)`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <GripHorizontal className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
                      <span className="truncate text-[11px] font-bold text-white drop-shadow-sm">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 bg-black/20 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
                      <span>{task.progress}%</span>
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>

      {/* Legend & Pillar Palettes */}
      <div className="border-t border-border p-3.5 bg-card flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">Paleta dos Pilares:</span>
          <div className="flex flex-wrap items-center gap-3">
            {activePillarList.map((pName) => {
              const c = getPillarColor(pName);
              return (
                <div key={pName} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                  <span className="text-muted-foreground text-[11px]">{pName}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
          <span>💡 Clique em qualquer bloco para editar tarefas ou ajustar progresso.</span>
        </div>
      </div>
    </div>
  );
}
