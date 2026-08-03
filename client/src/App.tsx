import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PillarProvider } from "./contexts/PillarContext";
import { DatabaseProvider } from "./contexts/DatabaseContext";
import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import KanbanPage from "./pages/KanbanPage";
import MindmapPage from "./pages/MindmapPage";
import Roadmap from "./pages/Roadmap";
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"}>
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/kanban"}>
        <ProtectedRoute>
          <KanbanPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/mindmap"}>
        <ProtectedRoute>
          <MindmapPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/roadmap"}>
        <ProtectedRoute>
          <Roadmap />
        </ProtectedRoute>
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <ThemeProvider>
          <PillarProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </PillarProvider>
        </ThemeProvider>
      </DatabaseProvider>
    </ErrorBoundary>
  );
}

export default App;
