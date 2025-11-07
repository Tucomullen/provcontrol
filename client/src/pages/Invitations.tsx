import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Copy, X, Check, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CommunityInvitation } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Invitations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"propietario" | "presidente" | "proveedor">("propietario");
  const [propertyUnit, setPropertyUnit] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: invitations, isLoading } = useQuery<CommunityInvitation[]>({
    queryKey: ["/api/invitations", user?.communityId],
    enabled: !!user?.communityId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/invitations", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      setOpenDialog(false);
      setEmail("");
      setPropertyUnit("");
      setRole("propietario");
      toast({
        title: "Invitación creada",
        description: "La invitación se ha enviado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la invitación",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/invitations/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      toast({
        title: "Invitación cancelada",
        description: "La invitación ha sido cancelada",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.communityId) return;

    createMutation.mutate({
      communityId: user.communityId,
      email,
      role,
      propertyUnit: propertyUnit || undefined,
    });
  };

  const copyToClipboard = async (code: string) => {
    const inviteUrl = `${window.location.origin}/?invite=${code}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Código copiado",
      description: "El enlace de invitación se ha copiado al portapapeles",
    });
  };

  const getStatusBadge = (status: string, expiresAt: Date) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired && status === "pendiente") {
      return <Badge variant="destructive">Expirada</Badge>;
    }

    switch (status) {
      case "pendiente":
        return <Badge variant="outline">Pendiente</Badge>;
      case "aceptada":
        return <Badge variant="default">Aceptada</Badge>;
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user || user.role !== "presidente") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Solo los presidentes pueden gestionar invitaciones
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Invitaciones</h1>
          <p className="text-muted-foreground">
            Gestiona las invitaciones a la comunidad
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-invitation">
              <UserPlus className="w-4 h-4 mr-2" />
              Nueva Invitación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Crear Invitación</DialogTitle>
                <DialogDescription>
                  Invita a un nuevo miembro a la comunidad
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@email.com"
                    required
                    data-testid="input-invitation-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={role} onValueChange={(v: any) => setRole(v)}>
                    <SelectTrigger data-testid="select-invitation-role">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="propietario">Propietario</SelectItem>
                      <SelectItem value="presidente">Presidente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyUnit">Unidad/Piso (Opcional)</Label>
                  <Input
                    id="propertyUnit"
                    value={propertyUnit}
                    onChange={(e) => setPropertyUnit(e.target.value)}
                    placeholder="Ej: 2º A"
                    data-testid="input-property-unit"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-send-invitation">
                  {createMutation.isPending ? "Enviando..." : "Enviar Invitación"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invitaciones Activas</CardTitle>
          <CardDescription>
            Lista de todas las invitaciones enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Cargando invitaciones...</p>
          ) : !invitations || invitations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay invitaciones pendientes
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id} data-testid={`row-invitation-${invitation.id}`}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell className="capitalize">{invitation.role}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {invitation.invitationCode}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard(invitation.invitationCode)}
                          data-testid={`button-copy-${invitation.id}`}
                        >
                          {copiedCode === invitation.invitationCode ? (
                            <Check className="w-4 h-4 text-chart-2" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invitation.status, invitation.expiresAt)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invitation.expiresAt), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      {invitation.status === "pendiente" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => cancelMutation.mutate(invitation.id)}
                          disabled={cancelMutation.isPending}
                          data-testid={`button-cancel-${invitation.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}