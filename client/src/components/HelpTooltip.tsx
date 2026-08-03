import React from "react";
import { HelpCircle, Info, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface HelpTooltipProps {
  title: string;
  description: string;
  steps?: string[];
  align?: "start" | "center" | "end";
  size?: "sm" | "md";
}

export default function HelpTooltip({
  title,
  description,
  steps,
  align = "start",
  size = "md",
}: HelpTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0 ${
            size === "sm" ? "h-6 w-6 p-0" : "h-7 w-7"
          }`}
          title={`Como usar: ${title}`}
        >
          <div className="relative flex items-center justify-center">
            <HelpCircle className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
            <span className="sr-only">Instruções de {title}</span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className="w-80 p-4 bg-background text-foreground border-2 border-border shadow-xl rounded-xl z-50 space-y-3"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
              {title}
            </h4>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Guia Rápido de Uso
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>

        {steps && steps.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-semibold text-foreground">Como Funciona:</p>
            <ul className="space-y-1">
              {steps.map((step, idx) => (
                <li
                  key={idx}
                  className="text-[11px] text-muted-foreground flex items-start gap-2"
                >
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
