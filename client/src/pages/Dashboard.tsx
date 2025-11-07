import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Users, FileCheck, TrendingUp, Activity, Star, Clock, Award, MessageSquare, Plus, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Incident, Provider, Rating, Document } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, isPresidente } = useAuth();
  const [, setLocation] = useLocation();

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

  const recentIncidents = incidents?.slice(0, 5) || [];
  const topProviders = providers?.sort((a, b) => 
    parseFloat(b.averageRating || "0") - parseFloat(a.averageRating || "0")
  ).slice(0, 3) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "abierta": return "bg-warning";
      case "presupuestada": return "bg-info";
      case "aprobada": return "bg-success";
      case "en_curso": return "bg-primary";
      case "resuelta": return "bg-verified";
      default: return "bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "abierta": return "Abierta";
      case "presupuestada": return "Presupuestada";
      case "aprobada": return "Aprobada";
      case "en_curso": return "En Curso";
      case "resuelta": return "Resuelta";
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-innovation rounded-2xl p-8 shadow-xl text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" data-testid="text-dashboard-title">
              Hola, {user?.firstName}! 👋
            </h1>
            <p className="text-lg text-white/90">
              {isPresidente 
                ? "Gestiona tu comunidad con el control total como presidente" 
                : user?.role === "propietario"
                ? "Mantente al día con las novedades de tu comunidad"
                : "Gestiona tus servicios y valoraciones"}
            </p>
          </div>
          <Avatar className="h-20 w-20 ring-4 ring-white/20 hidden md:block">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="text-2xl bg-white/20">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats Grid */}
      {user?.role !== "proveedor" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-warning hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidencias Activas</CardTitle>
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning" data-testid="stat-incidents-open">
                {stats.incidentsOpen}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pendientes de resolución
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary" data-testid="stat-providers">
                {stats.totalProviders}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Profesionales verificados
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-verified hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valoraciones</CardTitle>
              <div className="h-10 w-10 rounded-full bg-verified/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-verified fill-verified" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-verified" data-testid="stat-ratings">
                {stats.totalRatings}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de reseñas
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-info hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos</CardTitle>
              <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-info" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-info" data-testid="stat-documents">
                {stats.totalDocuments}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Archivos compartidos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Incidents */}
        {user?.role !== "proveedor" && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Actividad Reciente
                  </CardTitle>
                  <CardDescription>Últimas incidencias reportadas</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/incidencias")}
                  data-testid="button-view-all-incidents"
                >
                  Ver Todas
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentIncidents.length > 0 ? (
                recentIncidents.map((incident) => (
                  <div 
                    key={incident.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover-elevate cursor-pointer border border-border/50"
                    onClick={() => setLocation("/incidencias")}
                    data-testid={`card-incident-${incident.id}`}
                  >
                    <div className={`h-2 w-2 rounded-full mt-2 ${getStatusColor(incident.status)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{incident.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getStatusLabel(incident.status)}
                        </Badge>
                        {incident.createdAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(incident.createdAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay incidencias recientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Top Providers */}
        {user?.role !== "proveedor" && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Proveedores Top
                  </CardTitle>
                  <CardDescription>Mejor valorados de la comunidad</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/proveedores")}
                  data-testid="button-view-all-providers"
                >
                  Ver Todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {topProviders.length > 0 ? (
                topProviders.map((provider, index) => (
                  <div 
                    key={provider.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover-elevate cursor-pointer border border-border/50"
                    onClick={() => setLocation(`/proveedores/${provider.id}`)}
                    data-testid={`card-provider-${provider.id}`}
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent/80 text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <Avatar className="h-12 w-12 ring-2 ring-border">
                      <AvatarImage src={provider.logoUrl || undefined} />
                      <AvatarFallback className="bg-primary text-white">
                        {provider.companyName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{provider.companyName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          <span className="text-xs font-medium">{provider.averageRating || "0.0"}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {provider.totalJobs || 0} trabajos
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay proveedores aún</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
