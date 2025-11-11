import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "./useAuth";

interface OnboardingStatus {
  hasCommunities: boolean;
  userHasCommunity: boolean;
  needsEmailVerification: boolean;
  canCreateCommunity: boolean;
  hasProviderProfile?: boolean;
}

export function useOnboarding() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  const { data: status, isLoading: statusLoading } = useQuery<OnboardingStatus>({
    queryKey: ["/api/onboarding/status"],
    queryFn: async () => {
      const response = await fetch("/api/onboarding/status", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch onboarding status");
      }
      return response.json();
    },
    enabled: !!user, // Solo ejecutar si el usuario está autenticado
    retry: false,
  });

  const redirectToOnboarding = () => {
    if (!status || !user) return;

    // Proveedores no necesitan comunidad, solo perfil de proveedor
    if (user.role === "proveedor") {
      if (!status.hasProviderProfile) {
        setLocation("/onboarding/create-provider-profile");
        return;
      }
      // Si tiene perfil, no necesita onboarding
      return;
    }

    // Si necesita verificar email y es presidente
    if (status.needsEmailVerification && user.role === "presidente") {
      setLocation("/onboarding/verify-email");
      return;
    }

    // Si no tiene comunidad y no hay comunidades, puede crear una
    if (!status.userHasCommunity && status.canCreateCommunity) {
      setLocation("/onboarding/create-community");
      return;
    }

    // Si no tiene comunidad pero hay comunidades existentes, debe unirse
    if (!status.userHasCommunity && status.hasCommunities) {
      setLocation("/onboarding/join");
      return;
    }
  };

  return {
    status,
    isLoading: authLoading || statusLoading,
    redirectToOnboarding,
    needsOnboarding: status
      ? (user?.role === "proveedor" && !status.hasProviderProfile) ||
        (user?.role !== "proveedor" && (!status.userHasCommunity || (status.needsEmailVerification && user?.role === "presidente")))
      : false,
  };
}

