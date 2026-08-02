import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Sun,
  Moon,
  Layers,
  Brain,
  BarChart3,
  Kanban,
  Sparkles,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import PillarManagerDialog from "./PillarManagerDialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("sidebar-width");
    return saved ? parseInt(saved, 10) : 260;
  });
  const { loading } = useAuth();

  useEffect(() => {
    localStorage.setItem("sidebar-width", sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  const [pillarDialogOpen, setPillarDialogOpen] = useState(false);

  const menuItems = [
    {
      icon: BarChart3,
      label: "Dashboard Executivo",
      path: "/",
      badge: "KPIs",
    },
    {
      icon: Brain,
      label: "Mapa Mental",
      path: "/mindmap",
      badge: "Outline",
    },
    {
      icon: LayoutDashboard,
      label: "Roadmap Executivo",
      path: "/roadmap",
      badge: null,
    },
    {
      icon: Kanban,
      label: "Quadro Kanban",
      path: "/kanban",
      badge: "Trello",
    },
  ];

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= 200 && newWidth <= 420) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-border bg-card/80 backdrop-blur-md"
          disableTransition={isResizing}
        >
          {/* Header */}
          <SidebarHeader className="h-16 justify-center px-3 border-b border-border/50">
            <div className="flex items-center gap-3 transition-all w-full">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              {!isCollapsed ? (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm tracking-tight text-foreground truncate">
                    RESOLUTY
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                    Roadmap System
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          {/* Navigation Menu */}
          <SidebarContent className="gap-1 py-3 px-2">
            <SidebarMenu>
              {menuItems.map((item, idx) => {
                const isActive = item.path && location === item.path;
                return (
                  <SidebarMenuItem key={idx}>
                    <SidebarMenuButton
                      isActive={Boolean(isActive)}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else if (item.path && !item.path.startsWith("#")) {
                          setLocation(item.path);
                        }
                      }}
                      tooltip={item.label}
                      className={`h-10 transition-all font-medium rounded-lg px-3 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-primary-foreground" : "text-muted-foreground"
                        }`}
                      />
                      <span className="truncate flex-1 text-xs">{item.label}</span>
                      {item.badge && !isCollapsed && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                            item.badge === "Em breve"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          {/* Sidebar Footer with Theme, Pillars & User Profile */}
          <SidebarFooter className="p-3 border-t border-border/50 gap-2">
            {!isCollapsed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPillarDialogOpen(true)}
                className="w-full justify-start gap-2 text-xs border-border bg-card/50 hover:bg-muted"
              >
                <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">Configurar Pilares</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-muted/80 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none">
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "R"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-xs font-semibold truncate leading-none text-foreground">
                      {user?.name || "Alta Gestão"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-1">
                      {user?.email || "gestao@resoluty.com"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive text-xs"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${
            isCollapsed ? "hidden" : ""
          }`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-background">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Toggle navigation"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-foreground">
                Resoluty Roadmap System
              </span>
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-semibold px-2 py-0.5 rounded-full hidden sm:inline-block">
                Alta Gestão
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Settings & Pillar Config Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPillarDialogOpen(true)}
              className="gap-1.5 text-xs h-8 flex border-border"
              title="Configurações & Gestão de Pilares"
            >
              <Settings className="w-3.5 h-3.5 text-primary" />
              <span className="hidden md:inline">Configurações</span>
            </Button>

            {/* Light / Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-foreground hover:bg-muted rounded-lg"
              title={`Alternar para modo ${theme === "dark" ? "claro" : "escuro"}`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
          {children}
        </main>
      </SidebarInset>

      <PillarManagerDialog
        open={pillarDialogOpen}
        onOpenChange={setPillarDialogOpen}
      />
    </>
  );
}
