// Replit Auth integration
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isPresidente: user?.role === "presidente",
    isPropietario: user?.role === "propietario",
    isProveedor: user?.role === "proveedor",
  };
}