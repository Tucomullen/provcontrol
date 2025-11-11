import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Building2, CheckCircle2, XCircle, Loader2, Users, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function JoinCommunity() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Verificar código de invitación
  const verifyInvitationQuery = useQuery({
    queryKey: ["/api/invitations/verify", code],
    queryFn: async () => {
      if (!code || code.length !== 8) return null;
      const response = await fetch(`/api/invitations/verify/${code}`, {
        credentials: "include",
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: false, // Solo ejecutar cuando se llame manualmente
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: async (invitationCode: string) => {
      const response = await fetch(`/api/invitations/accept/${invitationCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al aceptar la invitación");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Invitación aceptada!",
        description: "Has sido agregado a la comunidad exitosamente.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error al aceptar invitación",
        description: error.message || "Por favor, verifica el código e intenta de nuevo",
        variant: "destructive",
      });
    },
  });

  const handleVerify = async () => {
    if (!code || code.length !== 8) {
      toast({
        title: "Código inválido",
        description: "El código de invitación debe tener 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`/api/invitations/verify/${code}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Código inválido o expirado");
      }

      const invitation = await response.json();
      verifyInvitationQuery.refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo verificar el código",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAccept = () => {
    if (!code) return;
    acceptInvitationMutation.mutate(code);
  };

  const invitation = verifyInvitationQuery.data;
  const isExpired = invitation && new Date(invitation.expiresAt) < new Date();
  const isUsed = invitation && invitation.status !== "pendiente";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">Unirse a una Comunidad</CardTitle>
          </div>
          <CardDescription>
            Ingresa el código de invitación que recibiste para unirte a una comunidad existente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Código de Invitación</label>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
                  setCode(value);
                }}
                placeholder="ABCD1234"
                className="w-full font-mono text-center text-lg tracking-widest"
                maxLength={8}
              />
              <Button
                onClick={handleVerify}
                disabled={!code || code.length !== 8 || isVerifying}
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verificar"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              El código suele tener 8 caracteres alfanuméricos
            </p>
          </div>

          {/* Mostrar información de la invitación si es válida */}
          {invitation && !isExpired && !isUsed && (
            <div className="border rounded-lg p-4 bg-primary/5 border-primary/20 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Código válido</p>
                  <p className="text-sm text-muted-foreground">
                    Has sido invitado a unirte a esta comunidad
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Rol:</span>{" "}
                    <Badge variant="secondary">
                      {invitation.role === "presidente" && "Presidente"}
                      {invitation.role === "propietario" && "Propietario"}
                      {invitation.role === "proveedor" && "Proveedor"}
                    </Badge>
                  </span>
                </div>
                {invitation.propertyUnit && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Unidad:</span> {invitation.propertyUnit}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Email invitado:</span> {invitation.email}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleAccept}
                className="w-full mt-4"
                disabled={acceptInvitationMutation.isPending}
              >
                {acceptInvitationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Aceptando...
                  </>
                ) : (
                  "Aceptar Invitación"
                )}
              </Button>
            </div>
          )}

          {/* Mostrar error si está expirado o usado */}
          {(isExpired || isUsed) && (
            <div className="border rounded-lg p-4 bg-destructive/5 border-destructive/20">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">
                    {isExpired ? "Invitación expirada" : "Invitación ya utilizada"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isExpired
                      ? "Esta invitación ha expirado. Contacta al presidente de la comunidad para obtener una nueva invitación."
                      : "Esta invitación ya fue utilizada. Si necesitas acceso, solicita una nueva invitación."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              ¿No tienes un código?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setLocation("/")}
              >
                Volver al inicio
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

