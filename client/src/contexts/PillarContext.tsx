import React, { createContext, useContext, useEffect, useState } from "react";

export interface StrategicPillar {
  id: string;
  name: string;
  color: string; // Hex e.g. #F59E0B
  description?: string;
}

export const DEFAULT_PILLARS: StrategicPillar[] = [
  {
    id: "google",
    name: "Google",
    color: "#F59E0B", // Amarelo Gold
    description: "Estratégias de SEO, SEM, Google Ads e presença orgânica",
  },
  {
    id: "redes-sociais",
    name: "Redes Sociais",
    color: "#EC4899", // Rosa/Pink
    description: "Engajamento, gestão de conteúdo e tráfego pago em mídias sociais",
  },
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    color: "#8B5CF6", // Roxo
    description: "CRM, funis de conversão, automações de vendas e e-mail marketing",
  },
  {
    id: "make-com",
    name: "Make.com",
    color: "#3B82F6", // Azul
    description: "Integrações de sistemas, webhooks e automação de processos",
  },
  {
    id: "ferramentas-complementares",
    name: "Ferramentas Complementares",
    color: "#10B981", // Verde
    description: "Softwares de apoio, inteligência artificial e utilitários",
  },
];

interface PillarContextType {
  pillars: StrategicPillar[];
  addPillar: (name: string, color: string, description?: string) => void;
  updatePillar: (id: string, name: string, color: string, description?: string) => void;
  removePillar: (id: string) => void;
  getPillarColor: (pillarName: string) => string;
  getPillar: (pillarName: string) => StrategicPillar | undefined;
}

const PillarContext = createContext<PillarContextType | undefined>(undefined);

const STORAGE_KEY = "resoluty_strategic_pillars_v3";

export function PillarProvider({ children }: { children: React.ReactNode }) {
  const [pillars, setPillars] = useState<StrategicPillar[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error loading pillars from localStorage", e);
    }
    return DEFAULT_PILLARS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pillars));
    } catch (e) {
      console.error("Error saving pillars to localStorage", e);
    }
  }, [pillars]);

  const addPillar = (name: string, color: string, description?: string) => {
    const formattedName = name.trim();
    if (!formattedName) return;

    // Check if exists
    const existingIndex = pillars.findIndex(
      (p) => p.name.toLowerCase() === formattedName.toLowerCase()
    );

    if (existingIndex >= 0) {
      const updated = [...pillars];
      updated[existingIndex] = {
        ...updated[existingIndex],
        color,
        description: description || updated[existingIndex].description,
      };
      setPillars(updated);
    } else {
      const id = formattedName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      setPillars((prev) => [
        ...prev,
        { id, name: formattedName, color, description },
      ]);
    }
  };

  const updatePillar = (id: string, name: string, color: string, description?: string) => {
    const formattedName = name.trim();
    if (!formattedName) return;

    setPillars((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, name: formattedName, color, description }
          : p
      )
    );
  };

  const removePillar = (id: string) => {
    setPillars((prev) => prev.filter((p) => p.id !== id));
  };

  const getPillarColor = (pillarName: string): string => {
    if (!pillarName) return "#6B7280";
    const found = pillars.find(
      (p) => p.name.toLowerCase() === pillarName.toLowerCase()
    );
    if (found) return found.color;

    const nameLower = pillarName.toLowerCase();
    if (nameLower.includes("google")) return "#F59E0B";
    if (nameLower.includes("rede") || nameLower.includes("social")) return "#EC4899";
    if (nameLower.includes("gohighlevel") || nameLower.includes("ghl")) return "#8B5CF6";
    if (nameLower.includes("make")) return "#3B82F6";
    if (nameLower.includes("ferramenta") || nameLower.includes("comp")) return "#10B981";

    return "#3B82F6";
  };

  const getPillar = (pillarName: string): StrategicPillar | undefined => {
    return pillars.find(
      (p) => p.name.toLowerCase() === pillarName.toLowerCase()
    );
  };

  return (
    <PillarContext.Provider
      value={{ pillars, addPillar, updatePillar, removePillar, getPillarColor, getPillar }}
    >
      {children}
    </PillarContext.Provider>
  );
}

export function usePillars() {
  const context = useContext(PillarContext);
  if (!context) {
    throw new Error("usePillars must be used within a PillarProvider");
  }
  return context;
}
