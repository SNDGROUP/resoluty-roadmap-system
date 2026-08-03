import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

const DEFAULT_USER = {
  id: 1,
  openId: "admin-default",
  name: "Administrador Resoluty",
  email: "admin@resoluty.com",
  role: "admin",
};

export function useAuth(options?: { redirectOnUnauthenticated?: boolean }) {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const user = meQuery.data ?? DEFAULT_USER;
  const loading = meQuery.isLoading && !timedOut && !meQuery.isError;

  return {
    user,
    loading,
    logout: () => logoutMutation.mutate(),
  };
}

