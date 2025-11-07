import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  ThumbsUp, 
  Share2,
  AlertCircle,
  FileText,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Incident, Rating, Provider } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Feed() {
  const { user } = useAuth();

  const { data: incidents } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const { data: ratings } = useQuery<Rating[]>({
    queryKey: ["/api/ratings"],
  });

  const { data: providers } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  // Combine and sort activities
  const activities = [
    ...(incidents?.map(i => ({ 
      type: 'incident' as const, 
      data: i, 
      timestamp: i.createdAt 
    })) || []),
    ...(ratings?.map(r => ({ 
      type: 'rating' as const, 
      data: r, 
      timestamp: r.createdAt 
    })) || []),
  ].sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 20);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'incident': return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'rating': return <Star className="w-5 h-5 text-accent fill-accent" />;
      case 'budget': return <FileText className="w-5 h-5 text-info" />;
      default: return <Activity className="w-5 h-5 text-primary" />;
    }
  };

  const topProviders = providers?.sort((a, b) => 
    parseFloat(b.averageRating || "0") - parseFloat(a.averageRating || "0")
  ).slice(0, 5) || [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-innovation rounded-2xl p-6 shadow-xl text-white">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Activity className="w-8 h-8" />
              Actividad de la Comunidad
            </h1>
            <p className="text-white/90">
              Mantente al día con todo lo que está pasando
            </p>
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <Card key={index} className="hover-elevate shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {activity.type === 'incident' && (
                          <>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="font-semibold text-base">
                                  Nueva Incidencia Reportada
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {activity.timestamp && formatDistanceToNow(new Date(activity.timestamp), {
                                    addSuffix: true,
                                    locale: es,
                                  })}
                                </p>
                              </div>
                              <Badge variant="outline" className="flex-shrink-0">
                                {activity.data.status === 'abierta' && 'Abierta'}
                                {activity.data.status === 'presupuestada' && 'Presupuestada'}
                                {activity.data.status === 'resuelta' && 'Resuelta'}
                              </Badge>
                            </div>
                            <p className="text-foreground font-medium mb-2">
                              {activity.data.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {activity.data.description}
                            </p>
                            {activity.data.photoUrls && activity.data.photoUrls.length > 0 && (
                              <div className="mt-3 flex gap-2">
                                {activity.data.photoUrls.slice(0, 3).map((url, i) => (
                                  <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted">
                                    <img 
                                      src={url} 
                                      alt="" 
                                      className="object-cover w-full h-full hover:scale-110 transition-transform"
                                    />
                                  </div>
                                ))}
                                {activity.data.photoUrls.length > 3 && (
                                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                                    +{activity.data.photoUrls.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {activity.type === 'rating' && (
                          <>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="font-semibold text-base">
                                  Nueva Valoración Publicada
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {activity.timestamp && formatDistanceToNow(new Date(activity.timestamp), {
                                    addSuffix: true,
                                    locale: es,
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 bg-accent/10 px-3 py-1 rounded-full">
                                <Star className="w-4 h-4 fill-accent text-accent" />
                                <span className="font-bold text-accent">{activity.data.overallRating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-foreground mb-2">
                              {activity.data.comment}
                            </p>
                            {activity.data.photoUrls && activity.data.photoUrls.length > 0 && (
                              <div className="mt-3 flex gap-2">
                                {activity.data.photoUrls.slice(0, 4).map((url, i) => (
                                  <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
                                    <img 
                                      src={url} 
                                      alt="" 
                                      className="object-cover w-full h-full hover:scale-110 transition-transform"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            {activity.data.providerReply && (
                              <div className="mt-3 p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
                                <p className="text-xs font-medium text-primary mb-1">Respuesta del Proveedor</p>
                                <p className="text-sm">{activity.data.providerReply}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 pt-3 border-t">
                      <Button variant="ghost" size="sm" className="hover-elevate" data-testid="button-like">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Me gusta
                      </Button>
                      <Button variant="ghost" size="sm" className="hover-elevate" data-testid="button-comment">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Comentar
                      </Button>
                      <Button variant="ghost" size="sm" className="hover-elevate" data-testid="button-share">
                        <Share2 className="w-4 h-4 mr-1" />
                        Compartir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="py-16">
                <CardContent className="text-center">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-xl font-medium text-muted-foreground mb-2">
                    No hay actividad reciente
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sé el primero en reportar una incidencia o valorar un proveedor
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Providers */}
          <Card className="shadow-lg sticky top-6">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-bold">Proveedores Destacados</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Los mejor valorados esta semana
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {topProviders.map((provider, index) => (
                <div 
                  key={provider.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer border border-border/50"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent/80 text-white font-bold text-sm flex-shrink-0">
                    #{index + 1}
                  </div>
                  <Avatar className="h-10 w-10 ring-2 ring-border flex-shrink-0">
                    <AvatarImage src={provider.logoUrl || undefined} />
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {provider.companyName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{provider.companyName}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <span className="text-xs font-medium">{provider.averageRating || "0.0"}</span>
                    </div>
                  </div>
                </div>
              ))}
              {topProviders.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No hay proveedores aún</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-lg">
            <CardHeader>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Estadísticas
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <span className="text-sm font-medium">Incidencias</span>
                </div>
                <span className="text-lg font-bold text-primary">{incidents?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Valoraciones</span>
                </div>
                <span className="text-lg font-bold text-accent">{ratings?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-verified/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-verified" />
                  <span className="text-sm font-medium">Proveedores</span>
                </div>
                <span className="text-lg font-bold text-verified">{providers?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
