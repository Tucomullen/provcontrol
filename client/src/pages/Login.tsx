import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refetch } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // Refetch user data
      await refetch();

      toast({
        title: "Sesión iniciada",
        description: "Has iniciado sesión correctamente",
      });

      // Verificar estado de onboarding y redirigir
      try {
        const onboardingResponse = await fetch("/api/onboarding/status", {
          credentials: "include",
        });
        if (onboardingResponse.ok) {
          const onboardingStatus = await onboardingResponse.json();
          
          // Si necesita verificar email y es presidente
          if (onboardingStatus.needsEmailVerification && data.user?.role === "presidente") {
            setLocation("/onboarding/verify-email");
            return;
          }
          
          // Si no tiene comunidad y puede crear una
          if (!onboardingStatus.userHasCommunity && onboardingStatus.canCreateCommunity) {
            setLocation("/onboarding/create-community");
            return;
          }
          
          // Si no tiene comunidad pero hay comunidades, debe unirse
          if (!onboardingStatus.userHasCommunity && onboardingStatus.hasCommunities) {
            setLocation("/onboarding/join");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
      
      // Redirect to dashboard
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a Provcontrol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">¿No tienes una cuenta? </span>
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setLocation("/register")}
            >
              Regístrate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

