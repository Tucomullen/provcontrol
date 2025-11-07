import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  TrendingUp,
  CheckCircle2,
  Briefcase
} from "lucide-react";
import type { Provider, Rating, Incident } from "@shared/schema";
import { RatingCard } from "@/components/RatingCard";

export default function ProviderProfile() {
  const { id } = useParams<{ id: string }>();

  const { data: providers } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
    enabled: !!id,
  });

  const { data: ratings } = useQuery<Rating[]>({
    queryKey: ["/api/ratings"],
  });

  const { data: incidents } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const provider = providers?.find(p => p.id === id);
  const providerRatings = ratings?.filter(r => r.providerId === id) || [];
  const providerIncidents = incidents?.filter(i => i.assignedProviderId === id) || [];

  if (!provider && providers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-destructive mb-2">Proveedor no encontrado</p>
          <Link href="/proveedores">
            <Button data-testid="button-back-to-providers">Volver a Proveedores</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Cargando proveedor...</p>
        </div>
      </div>
    );
  }

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      fontaneria: "🔧",
      electricidad: "⚡",
      albanileria: "🏗️",
      jardineria: "🌿",
      pintura: "🎨",
      carpinteria: "🪚",
      limpieza: "🧹",
      cerrajeria: "🔐",
      climatizacion: "❄️",
      otros: "🛠️",
    };
    return emojis[category] || "🛠️";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Section */}
      <Card className="shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-innovation p-8 text-white">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-white/30">
              <AvatarImage src={provider.logoUrl || undefined} />
              <AvatarFallback className="bg-white text-primary text-3xl font-bold">
                {provider.companyName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{provider.companyName}</h1>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {getCategoryEmoji(provider.category)} {provider.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-white/90 mb-4">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{provider.totalJobs || 0} trabajos completados</span>
                    </div>
                    {provider.website && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.website}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-white/90 leading-relaxed max-w-2xl">
                    {provider.description || "Proveedor profesional de servicios para comunidades"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Star className="w-8 h-8 fill-accent text-accent" />
                      <span className="text-5xl font-bold">{provider.averageRating || "0.0"}</span>
                    </div>
                    <p className="text-sm text-white/80">{provider.totalRatings || 0} valoraciones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {provider.phone && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{provider.phone}</p>
                </div>
              </div>
            )}
            {provider.website && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-verified/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-verified" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sitio Web</p>
                  <p className="font-medium truncate">{provider.website}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-accent hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-accent" />
              </div>
              <span className="text-3xl font-bold text-accent">{provider.averageRating || "0.0"}</span>
            </div>
            <p className="text-sm text-muted-foreground">Valoración Media</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-verified hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-full bg-verified/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-verified" />
              </div>
              <span className="text-3xl font-bold text-verified">{provider.totalJobs || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Trabajos Completados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <span className="text-3xl font-bold text-primary">{providerRatings.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Valoraciones</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
              <span className="text-3xl font-bold text-info">
                {providerIncidents.filter(i => i.status === "en_curso").length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Trabajos Activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="ratings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="ratings">
            <Star className="w-4 h-4 mr-2" />
            Valoraciones ({providerRatings.length})
          </TabsTrigger>
          <TabsTrigger value="portfolio">
            <Award className="w-4 h-4 mr-2" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="history">
            <Calendar className="w-4 h-4 mr-2" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ratings" className="space-y-4">
          {providerRatings.length > 0 ? (
            providerRatings.map((rating) => (
              <RatingCard
                key={rating.id}
                rating={rating}
                providerName={provider.companyName}
                showProviderInfo={false}
              />
            ))
          ) : (
            <Card className="py-16">
              <CardContent className="text-center">
                <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-xl font-medium text-muted-foreground mb-2">
                  Sin valoraciones aún
                </p>
                <p className="text-sm text-muted-foreground">
                  Sé el primero en valorar a este proveedor
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Galería de Trabajos</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Extract photos from ratings */}
              {providerRatings.some(r => r.photoUrls && r.photoUrls.length > 0) ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {providerRatings.flatMap(r => r.photoUrls || []).slice(0, 12).map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={url}
                        alt={`Trabajo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay fotos disponibles todavía</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Trabajos</CardTitle>
            </CardHeader>
            <CardContent>
              {providerIncidents.length > 0 ? (
                <div className="space-y-3">
                  {providerIncidents.map((incident) => (
                    <div 
                      key={incident.id} 
                      className="flex items-start gap-4 p-4 border rounded-lg hover-elevate"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{incident.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {incident.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {incident.status === "resuelta" && "Resuelta"}
                            {incident.status === "en_curso" && "En Curso"}
                            {incident.status === "aprobada" && "Aprobada"}
                            {incident.status === "presupuestada" && "Presupuestada"}
                            {incident.status === "abierta" && "Abierta"}
                          </Badge>
                          {incident.finalCost && (
                            <span className="text-sm text-muted-foreground">
                              €{incident.finalCost}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay trabajos registrados aún</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">¿Listo para trabajar juntos?</h2>
          <p className="text-muted-foreground mb-6">
            Contacta con {provider.companyName} para solicitar un presupuesto
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" className="shadow-lg" data-testid="button-contact-phone">
              <Phone className="w-4 h-4 mr-2" />
              Contactar
            </Button>
            <Button variant="outline" size="lg" data-testid="button-contact-email">
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
