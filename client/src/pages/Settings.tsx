import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/RoleBadge";
import { useAuth } from "@/hooks/useAuth";
import { Building, User, Shield, Bell, Key, Globe } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : "U";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu perfil y preferencias</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Perfil de Usuario</CardTitle>
              <CardDescription>Información personal y de contacto</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                <User className="w-4 h-4 inline mr-2" />
                Nombre
              </Label>
              <Input
                id="firstName"
                value={user.firstName || ""}
                disabled
                className="bg-muted"
                data-testid="input-first-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input
                id="lastName"
                value={user.lastName || ""}
                disabled
                className="bg-muted"
                data-testid="input-last-name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              <Globe className="w-4 h-4 inline mr-2" />
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email || ""}
              disabled
              className="bg-muted"
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label>
              <Shield className="w-4 h-4 inline mr-2" />
              Rol
            </Label>
            <div>
              {user.role && <RoleBadge role={user.role} />}
            </div>
          </div>

          {user.communityId && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>
                  <Building className="w-4 h-4 inline mr-2" />
                  Comunidad
                </Label>
                <p className="text-sm text-muted-foreground">
                  ID de Comunidad: {user.communityId}
                </p>
              </div>

              {user.propertyUnit && (
                <div className="space-y-2">
                  <Label>Unidad/Piso</Label>
                  <p className="text-sm text-muted-foreground">{user.propertyUnit}</p>
                </div>
              )}
            </>
          )}

          <Separator />

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Autenticación</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tu cuenta está gestionada mediante autenticación local. Puedes actualizar tu información
                  personal en esta sección.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Bell className="w-5 h-5 inline mr-2" />
            Notificaciones
          </CardTitle>
          <CardDescription>Gestiona tus preferencias de notificación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Las preferencias de notificación estarán disponibles próximamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zona de Peligro</CardTitle>
          <CardDescription>Acciones irreversibles de la cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <p className="font-medium">Cerrar Sesión</p>
                <p className="text-sm text-muted-foreground">
                  Cierra sesión en este dispositivo
                </p>
              </div>
              <Button 
                variant="destructive" 
                data-testid="button-logout"
                onClick={() => logout()}
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}