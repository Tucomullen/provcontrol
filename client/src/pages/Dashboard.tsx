import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Users, FileCheck, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Incident, Provider, Rating, Document } from "@shared/schema";

export default function Dashboard() {
  const { user, isPresidente } = useAuth();

  const { data: incidents } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
    enabled: !!user && user.role !== "proveedor",
  });

  const { data: providers } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
    enabled: !!user && user.role !== "proveedor",
  });

  const { data: ratings } = useQuery<Rating[]>({
    queryKey: ["/api/ratings"],
    enabled: !!user,
  });

  const { data: documents } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    enabled: !!user && user.role !== "proveedor",
  });

  const stats = {
    incidentsOpen: incidents?.filter((i) => i.status !== "resuelta").length || 0,
    totalProviders: providers?.length || 0,
    totalRatings: ratings?.length || 0,
    totalDocuments: documents?.length || 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Bienvenido, {user?.firstName}. {isPresidente && "Como presidente, tienes acceso completo a todas las funciones de control."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {user?.role !== "proveedor" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incidencias Activas</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-incidents-open">{stats.incidentsOpen}</div>
                <p className="text-xs text-muted-foreground">
                  Incidencias pendientes de resolución
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-providers">{stats.totalProviders}</div>
                <p className="text-xs text-muted-foreground">
                  Profesionales en el directorio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-documents">{stats.totalDocuments}</div>
                <p className="text-xs text-muted-foreground">
                  Actas, facturas y documentación
                </p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificaciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-ratings">{stats.totalRatings}</div>
            <p className="text-xs text-muted-foreground">
              Ratings verificados en el sistema
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Incidencias</CardTitle>
            <CardDescription>Incidencias reportadas recientemente</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.role !== "proveedor" && incidents && incidents.length > 0 ? (
              <div className="space-y-4">
                {incidents.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">{incident.location}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(incident.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No hay incidencias registradas
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos movimientos en la comunidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratings && ratings.length > 0 ? (
                ratings.slice(0, 5).map((rating) => (
                  <div key={rating.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">Nueva calificación verificada</p>
                      <p className="text-xs text-muted-foreground">Rating: {rating.overallRating}/5</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(rating.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No hay actividad reciente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}