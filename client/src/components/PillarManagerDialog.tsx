import { useState } from "react";
import { usePillars, StrategicPillar } from "@/contexts/PillarContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Tag, Check, Palette, Edit2, X } from "lucide-react";
import { toast } from "sonner";
import HelpTooltip from "@/components/HelpTooltip";

interface PillarManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
  { name: "Gold / Amarelo", hex: "#F59E0B" },
  { name: "Rosa / Magenta", hex: "#EC4899" },
  { name: "Roxo / Violeta", hex: "#8B5CF6" },
  { name: "Azul / Oceano", hex: "#3B82F6" },
  { name: "Verde / Esmeralda", hex: "#10B981" },
  { name: "Ciano / Turquesa", hex: "#06B6D4" },
  { name: "Laranja / Coral", hex: "#F97316" },
  { name: "Vermelho / Rubro", hex: "#EF4444" },
  { name: "Índigo / Safira", hex: "#6366F1" },
  { name: "Teal / Menta", hex: "#14B8A6" },
];

export default function PillarManagerDialog({
  open,
  onOpenChange,
}: PillarManagerDialogProps) {
  const { pillars, addPillar, updatePillar, removePillar } = usePillars();
  const [editingPillarId, setEditingPillarId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [description, setDescription] = useState("");
  const [customHex, setCustomHex] = useState("");

  const handleStartEdit = (pillar: StrategicPillar) => {
    setEditingPillarId(pillar.id);
    setName(pillar.name);
    setSelectedColor(pillar.color);
    setDescription(pillar.description || "");
    setCustomHex(pillar.color);
  };

  const handleCancelEdit = () => {
    setEditingPillarId(null);
    setName("");
    setSelectedColor("#3B82F6");
    setDescription("");
    setCustomHex("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, informe o nome do pilar estratégico");
      return;
    }

    const colorToUse = customHex.trim() || selectedColor;

    if (editingPillarId) {
      updatePillar(editingPillarId, name, colorToUse, description);
      toast.success(`Pilar "${name.trim()}" atualizado em tempo real!`);
    } else {
      addPillar(name, colorToUse, description);
      toast.success(`Pilar "${name.trim()}" criado com sucesso!`);
    }

    handleCancelEdit();
  };

  const handleRemove = (pillar: StrategicPillar) => {
    if (editingPillarId === pillar.id) {
      handleCancelEdit();
    }
    removePillar(pillar.id);
    toast.info(`Pilar "${pillar.name}" removido com sucesso.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background text-foreground border-2 border-border shadow-2xl opacity-100 z-50">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  Gestão de Pilares Estratégicos
                  <HelpTooltip
                    title="Gestão de Pilares"
                    description="Os pilares estratégicos organizam o roadmap e definem as categorias de entrega da empresa (ex: Google, Redes Sociais, GoHighLevel)."
                    steps={[
                      "Clique em qualquer pilar existente para editar seu nome, cor ou descrição.",
                      "Cadastre novos pilares preenchendo o formulário abaixo.",
                      "Todas as alterações são refletidas em tempo real nos gráficos, linhas do tempo e tabelas.",
                    ]}
                  />
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Cadastre e personalize os pilares de atuação da empresa. Cada pilar possui uma cor identificadora para o Roadmap.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Existing Pillars List */}
        <div className="space-y-4 my-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Pilares Cadastrados ({pillars.length})</span>
            <span className="text-[10px] text-primary">Clique para editar um pilar</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pillars.map((p) => {
              const isEditing = editingPillarId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleStartEdit(p)}
                  className={`flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    isEditing
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-border bg-card text-card-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full mt-0.5 shrink-0 shadow-sm"
                      style={{ backgroundColor: p.color }}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate flex items-center gap-1.5">
                        {p.name}
                        {isEditing && (
                          <span className="text-[10px] bg-primary text-primary-foreground font-normal px-1.5 py-0.2 rounded">
                            Editando
                          </span>
                        )}
                      </p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEdit(p)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                      title="Editar pilar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(p)}
                      className="h-7 w-7 text-muted-foreground hover:text-rose-600 shrink-0"
                      title="Remover pilar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <hr className="border-border my-2" />

        {/* Form to Add / Edit Pilar */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              {editingPillarId ? (
                <>
                  <Edit2 className="w-4 h-4 text-primary" /> Editar Pilar Estratégico
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-primary" /> Adicionar Novo Pilar Estratégico
                </>
              )}
            </h4>
            {editingPillarId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="text-xs h-7 gap-1 text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" /> Cancelar Edição
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pillar-name" className="text-xs font-medium text-foreground">
                Nome do Pilar
              </Label>
              <Input
                id="pillar-name"
                placeholder="Ex: Inteligência Artificial & Automação"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center justify-between">
                <span>Cor do Pilar</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                  <Palette className="w-3 h-3 text-primary" /> Selecionada: {customHex || selectedColor}
                </span>
              </Label>

              {/* Preset Palette */}
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => {
                  const isSelected = (selectedColor === c.hex || customHex === c.hex);
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.hex);
                        setCustomHex(c.hex);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                          : "hover:scale-105 border-transparent"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex input */}
              <div className="pt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Hex Personalizado:</span>
                <Input
                  placeholder="#Hex (ex: #10B981)"
                  value={customHex}
                  onChange={(e) => {
                    setCustomHex(e.target.value);
                    setSelectedColor(e.target.value);
                  }}
                  className="w-36 h-8 text-xs font-mono bg-background text-foreground border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pillar-desc" className="text-xs font-medium text-foreground">
                Descrição (Opcional)
              </Label>
              <Input
                id="pillar-desc"
                placeholder="Breve resumo dos objetivos deste pilar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background text-foreground border-border"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            <Button type="submit" className="gap-2 bg-primary text-primary-foreground font-semibold">
              {editingPillarId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingPillarId ? "Salvar Alterações do Pilar" : "Salvar Novo Pilar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
