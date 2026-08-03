import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Search,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Edit2,
  Check,
  X,
  Building2,
  Users,
  Target,
} from "lucide-react";
import HelpTooltip from "@/components/HelpTooltip";

interface NodeItem {
  id: string;
  title: string;
  category?: string;
  responsible?: string;
  notes?: string;
  color?: string;
  children?: NodeItem[];
}

const INITIAL_COMPANY_STRUCTURE: NodeItem = {
  id: "root-1",
  title: "Estrutura Organizacional & Estratégica Resoluty",
  category: "Conselho / Diretoria",
  responsible: "Presidência & C-Level",
  color: "#3B82F6",
  children: [
    {
      id: "node-google",
      title: "Pilar 1: Google Cloud & Inteligência Artificial",
      category: "Diretoria de Inovação",
      responsible: "Engenharia de IA & Cloud",
      color: "#4285F4",
      children: [
        {
          id: "node-google-1",
          title: "Sistemas RAG & Modelos Generativos Gemini",
          category: "Núcleo de Arquitetura",
          responsible: "Time de IA",
        },
        {
          id: "node-google-2",
          title: "Infraestrutura Kubernetes & GCP Cloud Run",
          category: "DevOps & SRE",
          responsible: "Infraestrutura",
        },
        {
          id: "node-google-3",
          title: "Modernização de Dados com BigQuery",
          category: "Data Platform",
          responsible: "Engenharia de Dados",
        },
      ],
    },
    {
      id: "node-apple",
      title: "Pilar 2: Ecossistema Apple & Mobile",
      category: "Diretoria de Produtos Mobile",
      responsible: "Engenharia iOS & UX",
      color: "#000000",
      children: [
        {
          id: "node-apple-1",
          title: "Aplicativo Nativo iOS (SwiftUI & Combine)",
          category: "Desenvolvimento Frontend",
          responsible: "Equipe Mobile iOS",
        },
        {
          id: "node-apple-2",
          title: "Integração Apple Wallet & Notificações Direct",
          category: "Inovações de Interface",
          responsible: "Mobile Specialist",
        },
      ],
    },
    {
      id: "node-gov",
      title: "Pilar 3: Governança & Conformidade LGPD",
      category: "Diretoria Jurídica & Riscos",
      responsible: "DPO & Compliance",
      color: "#10B981",
      children: [
        {
          id: "node-gov-1",
          title: "Matriz de Auditoria & Trilhas de Segurança",
          category: "Segurança da Informação",
          responsible: "Time CyberSec",
        },
        {
          id: "node-gov-2",
          title: "Mapeamento de Consentimento & Termos",
          category: "Jurídico",
          responsible: "Equipe Legal",
        },
      ],
    },
    {
      id: "node-ops",
      title: "Pilar 4: Operações & Eficiência Financeira",
      category: "Diretoria Operacional",
      responsible: "COO & PMO",
      color: "#8B5CF6",
      children: [
        {
          id: "node-ops-1",
          title: "Automação de Pipelines CI/CD & Deploy",
          category: "Engenharia de Processos",
          responsible: "DevOps",
        },
        {
          id: "node-ops-2",
          title: "Redução de Custos Cloud & FinOps",
          category: "Gestão Financeira Tech",
          responsible: "FinOps Officer",
        },
      ],
    },
    {
      id: "node-mkt",
      title: "Pilar 5: Expansão de Mercado & Go-To-Market",
      category: "Diretoria Comercial",
      responsible: "CMO & Growth",
      color: "#F59E0B",
      children: [
        {
          id: "node-mkt-1",
          title: "Estratégia de Lançamento & Parcerias B2B",
          category: "Novos Negócios",
          responsible: "Head de Vendas",
        },
        {
          id: "node-mkt-2",
          title: "Branding & Posicionamento Executivo",
          category: "Marketing",
          responsible: "Time de Design",
        },
      ],
    },
  ],
};

export default function MindmapPage() {
  const [tree, setTree] = useState<NodeItem>(INITIAL_COMPANY_STRUCTURE);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => setCollapsedNodes({});

  const startEditNode = (node: NodeItem) => {
    setEditingNodeId(node.id);
    setEditingTitle(node.title);
  };

  const saveEditNode = (nodeId: string) => {
    const updateTitle = (item: NodeItem): NodeItem => {
      if (item.id === nodeId) {
        return { ...item, title: editingTitle };
      }
      if (item.children) {
        return { ...item, children: item.children.map(updateTitle) };
      }
      return item;
    };
    setTree(updateTitle(tree));
    setEditingNodeId(null);
  };

  const addChildNode = (parentId: string) => {
    const newNode: NodeItem = {
      id: `node-${Date.now()}`,
      title: "Novo Sub-nó Estratégico",
      category: "Área de Atuação",
      responsible: "Responsável a definir",
    };

    const addRecursive = (item: NodeItem): NodeItem => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newNode],
        };
      }
      if (item.children) {
        return { ...item, children: item.children.map(addRecursive) };
      }
      return item;
    };

    setTree(addRecursive(tree));
    setCollapsedNodes((prev) => ({ ...prev, [parentId]: false }));
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === tree.id) return; // don't delete root

    const deleteRecursive = (item: NodeItem): NodeItem => {
      if (item.children) {
        return {
          ...item,
          children: item.children
            .filter((c) => c.id !== nodeId)
            .map(deleteRecursive),
        };
      }
      return item;
    };

    setTree(deleteRecursive(tree));
  };

  // Render tree outline nodes recursively
  const renderOutlineNode = (node: NodeItem, depth: number = 0) => {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isCollapsed = Boolean(collapsedNodes[node.id]);
    const isEditing = editingNodeId === node.id;

    const matchesSearch =
      !searchTerm.trim() ||
      node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.category && node.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (node.responsible && node.responsible.toLowerCase().includes(searchTerm.toLowerCase()));

    if (searchTerm.trim() && !matchesSearch && !hasChildren) {
      return null;
    }

    return (
      <div key={node.id} className="relative group">
        {/* Node Line Container */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 my-1.5 rounded-lg border transition-all ${
            depth === 0
              ? "bg-primary/10 border-primary/30 shadow-sm"
              : depth === 1
              ? "bg-card border-border shadow-xs"
              : "bg-muted/40 border-border/80"
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleCollapse(node.id)}
                className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors shrink-0"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            ) : (
              <span className="w-6 h-6 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              </span>
            )}

            {/* Icon representation */}
            {depth === 0 ? (
              <Building2 className="w-5 h-5 text-primary shrink-0" />
            ) : depth === 1 ? (
              <Target className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}

            {/* Editable Title or Static */}
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="h-8 text-xs bg-background text-foreground border-border"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => saveEditNode(node.id)}
                  className="h-7 w-7 text-emerald-600"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingNodeId(null)}
                  className="h-7 w-7 text-rose-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="min-w-0">
                <p className="font-semibold text-xs sm:text-sm text-foreground truncate">
                  {node.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  {node.category && (
                    <span className="font-medium px-1.5 py-0.5 bg-muted rounded">
                      {node.category}
                    </span>
                  )}
                  {node.responsible && (
                    <span>• Resp: {node.responsible}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Node Action Buttons */}
          <div className="flex items-center gap-1 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addChildNode(node.id)}
              className="h-7 text-[11px] text-primary hover:bg-primary/10 gap-1 px-2"
              title="Adicionar sub-ramificação"
            >
              <Plus className="w-3.5 h-3.5" /> Sub-nó
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => startEditNode(node)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Editar nó"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>

            {depth > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteNode(node.id)}
                className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                title="Excluir nó"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Children Render */}
        {!isCollapsed && hasChildren && (
          <div className="border-l-2 border-border ml-3 pl-1">
            {node.children!.map((child) => renderOutlineNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Brain className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                Mapa Mental Estrutural (Outline)
                <HelpTooltip
                  title="Mapa Mental & Árvore Estrutural"
                  description="Representação hierárquica e encadeada da estrutura operacional da Resoluty no formato MindMaster."
                  steps={[
                    "Clique nas setas verticais para recolher ou expandir ramos de diretoria.",
                    "Clique em '+ Sub-nó' para criar novos ramificações e desdobramentos estratégicos.",
                    "Utilize a ferramenta de edição de texto para modificar o título dos nós em tempo real.",
                  ]}
                />
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Visão hierárquica e ramificada da arquitetura e estrutura da empresa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar nó da estrutura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-9 bg-background text-foreground border-border"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="text-xs h-9 border-border"
            >
              Expandir Todos
            </Button>

            <Button
              onClick={() => addChildNode(tree.id)}
              className="gap-1.5 text-xs h-9 font-semibold bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4" /> Adicionar Pilar/Diretoria
            </Button>
          </div>
        </div>

        {/* Outline Canvas Container */}
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Árvore de Organização & Mapeamento
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
              Estilo MindMaster Outline
            </Badge>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-1">{renderOutlineNode(tree, 0)}</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
