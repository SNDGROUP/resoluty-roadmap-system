import { useState, useMemo } from "react";
import { Task, Phase } from "@/types/roadmap";
import { format, addDays, startOfWeek, startOfMonth, startOfQuarter, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GripHorizontal } from "lucide-react";

interface RoadmapTimelineProps {
  tasks: Task[];
  phases: Phase[];
  viewMode: "week" | "month" | "quarter";
  onTaskUpdate: () => void;
  onTaskEdit: (task: Task) => void;
}

const PILLARS = [
  "Google",
  "Redes Sociais",
  "GoHighLevel",
  "Make.com",
  "Ferramentas Complementares",
];

// Cores dos pilares usando variáveis CSS
const getPillarColor = (pillar: string): string => {
  const colorMap: Record<string, string> = {
    "Google": "var(--pillar-google)",
    "Redes Sociais": "var(--pillar-redes-sociais)",
    "GoHighLevel": "var(--pillar-gohighlevel)",
    "Make.com": "var(--pillar-make)",
    "Ferramentas Complementares": "var(--pillar-ferramentas)",
  };
  return colorMap[pillar] || "#999999";
};

const STATUS_COLORS: Record<string, string> = {
  "A Fazer": "bg-gray-400",
  "Em Andamento": "bg-blue-500",
  "Concluído": "bg-green-500",
  "Atrasado": "bg-red-500",
};

export default function RoadmapTimeline({
  tasks,
  phases,
  viewMode,
  onTaskUpdate,
  onTaskEdit,
}: RoadmapTimelineProps) {
  const [draggedTask, setDraggedTask] = useState<number | null>(null);

  // Generate timeline dates
  const timelineData = useMemo(() => {
    const today = new Date();
    const startDate = 
      viewMode === "week" ? startOfWeek(today, { locale: ptBR }) :
      viewMode === "month" ? startOfMonth(today) :
      startOfQuarter(today);

    const dates: Date[] = [];
    let current = new Date(startDate);
    
    const count = viewMode === "week" ? 7 : viewMode === "month" ? 30 : 90;
    for (let i = 0; i < count; i++) {
      dates.push(new Date(current));
      current = addDays(current, 1);
    }

    return dates;
  }, [viewMode]);

  // Group tasks by pillar
  const tasksByPillar = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    PILLARS.forEach(pillar => {
      grouped[pillar] = tasks.filter(t => t.pillar === pillar).sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    });
    return grouped;
  }, [tasks]);

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

  const getTaskOpacity = (task: Task) => {
    const progressMap: Record<string, number> = {
      "A Fazer": 0.6,
      "Em Andamento": 0.85,
      "Concluído": 1.0,
      "Atrasado": 0.7,
    };
    return progressMap[task.status] || 0.7;
  };

  const CELL_WIDTH = 48;
  const ROW_HEIGHT = 32;

  return (
    <div className="w-full bg-card rounded-lg border border-border overflow-hidden">
      {/* Header with dates */}
      <div className="overflow-x-auto">
        <div className="flex">
          <div className="w-48 flex-shrink-0 border-r border-border bg-muted p-4">
            <h3 className="font-semibold text-foreground text-sm">Pilares Estratégicos</h3>
          </div>
          <div className="flex" style={{ width: `${timelineData.length * CELL_WIDTH}px` }}>
            {timelineData.map((date, idx) => (
              <div
                key={idx}
                className={`flex-shrink-0 border-r border-border p-2 text-center text-xs ${
                  idx % 7 === 0 ? "bg-muted/70" : ""
                }`}
                style={{ width: `${CELL_WIDTH}px` }}
              >
                <div className="font-semibold text-foreground text-xs">
                  {format(date, "d", { locale: ptBR })}
                </div>
                <div className="text-muted-foreground text-xs">
                  {format(date, "EEE", { locale: ptBR }).substring(0, 1).toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline rows with tasks */}
      <div className="overflow-x-auto">
        <div className="flex">
          {/* Pillar names */}
          <div className="w-48 flex-shrink-0 border-r border-border">
            {PILLARS.map(pillar => (
              <div
                key={pillar}
                className="border-b border-border p-4 flex items-center font-semibold text-sm text-foreground bg-muted/30"
                style={{ height: `${ROW_HEIGHT * 4}px` }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getPillarColor(pillar) }}
                  />
                  <span>{pillar}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline grid and tasks */}
          <div className="relative" style={{ width: `${timelineData.length * CELL_WIDTH}px` }}>
            {/* Grid cells */}
            {PILLARS.map((pillar, pillarIdx) => (
              <div
                key={`grid-${pillar}`}
                className="absolute top-0 left-0 w-full border-b border-border"
                style={{
                  top: `${pillarIdx * ROW_HEIGHT * 4}px`,
                  height: `${ROW_HEIGHT * 4}px`,
                }}
              >
                {timelineData.map((date, dateIdx) => (
                  <div
                    key={dateIdx}
                    className={`absolute top-0 border-r border-b border-border hover:bg-muted/20 transition-colors ${
                      dateIdx % 7 === 0 ? "bg-muted/10" : "bg-background"
                    }`}
                    style={{
                      left: `${dateIdx * CELL_WIDTH}px`,
                      width: `${CELL_WIDTH}px`,
                      height: `${ROW_HEIGHT * 4}px`,
                    }}
                  />
                ))}
              </div>
            ))}

            {/* Tasks overlay */}
            {PILLARS.map((pillar, pillarIdx) =>
              tasksByPillar[pillar]?.map((task, taskIdx) => {
                const position = getTaskPosition(task);
                const width = getTaskWidth(task);
                const pillarColor = getPillarColor(pillar);

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskEdit(task)}
                    draggable
                    onDragStart={() => setDraggedTask(task.id)}
                    onDragEnd={() => setDraggedTask(null)}
                    className={`absolute rounded px-2 py-1 text-xs font-semibold text-white cursor-pointer flex items-center gap-1 group hover:shadow-lg transition-all pointer-events-auto ${
                      STATUS_COLORS[task.status]
                    }`}
                    style={{
                      left: `${position * CELL_WIDTH}px`,
                      top: `${pillarIdx * ROW_HEIGHT * 4 + taskIdx * ROW_HEIGHT + 4}px`,
                      width: `${Math.max(CELL_WIDTH, width * CELL_WIDTH)}px`,
                      height: `${ROW_HEIGHT - 8}px`,
                      opacity: draggedTask === task.id ? 0.7 : getTaskOpacity(task),
                      borderLeft: `4px solid ${pillarColor}`,
                      display: "flex",
                      alignItems: "center",
                      zIndex: draggedTask === task.id ? 50 : 10,
                    }}
                    title={`${task.title} (${task.progress}%)`}
                  >
                    <GripHorizontal className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                    <span className="truncate flex-1 text-xs">{task.title}</span>
                    <span className="text-xs opacity-75 flex-shrink-0">{task.progress}%</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Status:</span>
          </div>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${color}`} />
              <span className="text-foreground text-xs">{status}</span>
            </div>
          ))}
          
          <div className="flex items-center gap-2 ml-4">
            <span className="font-semibold text-foreground">Pilares:</span>
          </div>
          {PILLARS.map(pillar => (
            <div key={pillar} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: getPillarColor(pillar) }}
              />
              <span className="text-foreground text-xs">{pillar}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
