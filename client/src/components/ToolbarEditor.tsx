import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Pointer,
  Hand,
  Type,
  Square,
  GitBranch,
  Zap,
  Image,
  Lightbulb,
  Grid3x3,
  Maximize2,
  Download,
  Undo2,
  Redo2,
} from "lucide-react";

type ToolType =
  | "select"
  | "pan"
  | "text"
  | "shapes"
  | "diagram"
  | "icons"
  | "images"
  | "mindmap"
  | "tables"
  | "areas";

interface ToolbarEditorProps {
  onToolChange: (tool: ToolType) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExport?: () => void;
  activeTool?: ToolType;
}

const TOOLS: Array<{
  id: ToolType;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: "select",
    label: "Selecionar",
    icon: <Pointer className="w-5 h-5" />,
    description: "Selecionar e mover elementos",
  },
  {
    id: "pan",
    label: "Mão",
    icon: <Hand className="w-5 h-5" />,
    description: "Navegar pela timeline",
  },
  {
    id: "text",
    label: "Texto",
    icon: <Type className="w-5 h-5" />,
    description: "Adicionar anotações de texto",
  },
  {
    id: "shapes",
    label: "Formas",
    icon: <Square className="w-5 h-5" />,
    description: "Desenhar formas (retângulos, círculos, linhas)",
  },
  {
    id: "diagram",
    label: "Diagramação",
    icon: <GitBranch className="w-5 h-5" />,
    description: "Conectar elementos com linhas",
  },
  {
    id: "icons",
    label: "Ícones",
    icon: <Zap className="w-5 h-5" />,
    description: "Inserir ícones predefinidos",
  },
  {
    id: "images",
    label: "Imagens",
    icon: <Image className="w-5 h-5" />,
    description: "Upload e inserção de imagens",
  },
  {
    id: "mindmap",
    label: "Mapas Mentais",
    icon: <Lightbulb className="w-5 h-5" />,
    description: "Inserir mapas mentais",
  },
  {
    id: "tables",
    label: "Tabelas",
    icon: <Grid3x3 className="w-5 h-5" />,
    description: "Inserir tabelas",
  },
  {
    id: "areas",
    label: "Áreas",
    icon: <Maximize2 className="w-5 h-5" />,
    description: "Destacar áreas da timeline",
  },
];

export default function ToolbarEditor({
  onToolChange,
  onUndo,
  onRedo,
  onExport,
  activeTool = "select",
}: ToolbarEditorProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  return (
    <div className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {/* Main Tools */}
          <div className="flex gap-1 border-r border-border pr-2">
            {TOOLS.map(tool => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === tool.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToolChange(tool.id)}
                    className={`flex items-center gap-2 ${
                      activeTool === tool.id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {tool.icon}
                    <span className="hidden sm:inline text-xs">{tool.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-primary text-primary-foreground">
                  <p className="font-semibold">{tool.label}</p>
                  <p className="text-xs">{tool.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-1 ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUndo}
                  className="text-foreground hover:bg-muted"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Desfazer</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRedo}
                  className="text-foreground hover:bg-muted"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Refazer</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  className="text-foreground hover:bg-muted"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Exportar</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Tool Info */}
        {activeTool && (
          <div className="text-xs text-muted-foreground mt-2 pl-2 border-l-2 border-accent">
            {TOOLS.find(t => t.id === activeTool)?.description}
          </div>
        )}
      </div>
    </div>
  );
}
