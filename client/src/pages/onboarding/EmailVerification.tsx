import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function EmailVerification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, refetch } = useAuth();
  const [token, setToken] = useState("");
  const [searchParams] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("token") || "";
    }
    return "";
  });

  useEffect(() => {
    if (searchParams) {
      setToken(searchParams);
    }
  }, [searchParams]);

  const verifyEmailMutation = useMutation({
    mutationFn: async (verificationToken: string) => {
      return await apiRequest("POST", "/api/auth/verify-email", {
        token: verificationToken,
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Email verificado!",
        description: "Tu email ha sido verificado exitosamente.",
      });
      refetch();
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error al verificar email",
        description: error.message || "El token es inválido o ha expirado",
        variant: "destructive",
      });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al reenviar verificación");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Token enviado",
        description: process.env.NODE_ENV === "development"
          ? `Token: ${data.token}`
          : "Se ha enviado un nuevo email de verificación",
      });
      if (data.verificationUrl) {
        setToken(data.token);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo reenviar el token",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (!token) {
      toast({
        title: "Token requerido",
        description: "Por favor, ingresa el token de verificación",
        variant: "destructive",
      });
      return;
    }
    verifyEmailMutation.mutate(token);
  };

  const handleSkip = () => {
    toast({
      title: "Verificación omitida",
      description: "Puedes verificar tu email más tarde desde la configuración",
    });
    setLocation("/");
  };

  const isVerified = user?.emailVerified;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">Verificar Email</CardTitle>
          </div>
          <CardDescription>
            {isVerified
              ? "Tu email ya está verificado"
              : "Verifica tu dirección de email para completar tu registro"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerified ? (
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Email verificado
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Tu dirección de email {user?.email} ha sido verificada correctamente.
                  </p>
                </div>
              </div>
              <Button onClick={() => setLocation("/")} className="w-full mt-4">
                Continuar
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">
                      Verificación requerida
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {user?.role === "presidente"
                        ? "Como presidente, es importante verificar tu email para mantener la seguridad de la comunidad."
                        : "Verifica tu email para acceder a todas las funcionalidades."}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Token de Verificación</label>
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Pega el token aquí"
                  className="w-full font-mono"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  El token fue enviado a {user?.email} o puedes copiarlo desde la consola del navegador (en desarrollo)
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVerify}
                  disabled={!token || verifyEmailMutation.isPending}
                  className="flex-1"
                >
                  {verifyEmailMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar Email"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => resendVerificationMutation.mutate()}
                  disabled={resendVerificationMutation.isPending}
                >
                  {resendVerificationMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Reenviar"
                  )}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-full"
                >
                  Continuar sin verificar (no recomendado)
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

