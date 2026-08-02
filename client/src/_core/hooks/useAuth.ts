import { trpc } from "@/lib/trpc";

export function useAuth(options?: { redirectOnUnauthenticated?: boolean }) {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const user = meQuery.data ?? null;
  const loading = meQuery.isLoading;

  return {
    user,
    loading,
    logout: () => logoutMutation.mutate(),
  };
}
