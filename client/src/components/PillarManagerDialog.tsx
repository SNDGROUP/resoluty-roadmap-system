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
import { Plus, Trash2, Tag, Check, Palette } from "lucide-react";
import { toast } from "sonner";

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
  const { pillars, addPillar, removePillar } = usePillars();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [description, setDescription] = useState("");
  const [customHex, setCustomHex] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, informe o nome do pilar estratégico");
      return;
    }

    const colorToUse = customHex.trim() || selectedColor;
    addPillar(name, colorToUse, description);
    toast.success(`Pilar "${name.trim()}" criado com sucesso!`);
    setName("");
    setDescription("");
    setCustomHex("");
  };

  const handleRemove = (pillar: StrategicPillar) => {
    if (confirm(`Deseja remover o pilar "${pillar.name}"?`)) {
      removePillar(pillar.id);
      toast.info(`Pilar "${pillar.name}" removido.`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 shadow-2xl opacity-100 z-50">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Gestão de Pilares Estratégicos
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
                Cadastre e personalize os pilares de atuação da empresa. Cada pilar possui uma cor identificadora para o Roadmap.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Existing Pillars List */}
        <div className="space-y-4 my-2">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pilares Cadastrados ({pillars.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pillars.map((p) => (
              <div
                key={p.id}
                className="flex items-start justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full mt-0.5 shrink-0 shadow-sm"
                    style={{ backgroundColor: p.color }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {p.name}
                    </p>
                    {p.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(p)}
                  className="h-8 w-8 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
                  title="Remover pilar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-800 my-2" />

        {/* Form to Add New Pilar */}
        <form onSubmit={handleAdd} className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Adicionar Novo Pilar Estratégico
          </h4>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pillar-name" className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Nome do Pilar
              </Label>
              <Input
                id="pillar-name"
                placeholder="Ex: Inteligência Artificial & Automação"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Cor do Pilar</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Palette className="w-3 h-3" /> Selecionada: {customHex || selectedColor}
                </span>
              </Label>

              {/* Preset Palette */}
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => {
                  const isSelected = selectedColor === c.hex && !customHex;
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.hex);
                        setCustomHex("");
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
                <span className="text-xs text-slate-500 dark:text-slate-400">Hex Personalizado:</span>
                <Input
                  placeholder="#Hex (ex: #10B981)"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="w-36 h-8 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pillar-desc" className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Descrição (Opcional)
              </Label>
              <Input
                id="pillar-desc"
                placeholder="Breve resumo dos objetivos deste pilar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
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
            <Button type="submit" className="gap-2 bg-primary text-primary-foreground">
              <Plus className="w-4 h-4" />
              Salvar Pilar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
