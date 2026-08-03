import React, { createContext, useContext, useMemo } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder-project.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-anon-key";

interface DatabaseContextType {
  supabase: SupabaseClient;
  isConfigured: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { supabase, isConfigured } = useMemo(() => {
    const url = supabaseUrl;
    const key = supabaseAnonKey;
    const configured = Boolean(
      url &&
      !url.includes("placeholder") &&
      key &&
      !key.includes("placeholder")
    );
    const client = createClient(url, key);
    return { supabase: client, isConfigured: configured };
  }, []);

  return (
    <DatabaseContext.Provider value={{ supabase, isConfigured }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}
