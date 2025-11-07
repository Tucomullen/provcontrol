import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, MapPin, Clock, Award, TrendingUp, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon, getCategoryLabel } from "@/components/CategoryIcon";
import { StarRating } from "@/components/StarRating";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { Provider } from "@shared/schema";

export default function Providers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "jobs" | "recent">("rating");

  const { data: providers, isLoading } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  const filteredProviders = providers?.filter((provider) => {
    const matchesSearch =
      provider.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "rating") {
      return parseFloat(b.averageRating || "0") - parseFloat(a.averageRating || "0");
    } else if (sortBy === "jobs") {
      return (b.totalJobs || 0) - (a.totalJobs || 0);
    }
    return 0;
  });

  const categories = [
    { value: "all", label: "Todas", icon: "🏠" },
    { value: "fontaneria", label: "Fontanería", icon: "🔧" },
    { value: "electricidad", label: "Electricidad", icon: "⚡" },
    { value: "albanileria", label: "Albañilería", icon: "🧱" },
    { value: "jardineria", label: "Jardinería", icon: "🌿" },
    { value: "pintura", label: "Pintura", icon: "🎨" },
    { value: "carpinteria", label: "Carpintería", icon: "🪵" },
    { value: "limpieza", label: "Limpieza", icon: "✨" },
    { value: "cerrajeria", label: "Cerrajería", icon: "🔐" },
    { value: "climatizacion", label: "Climatización", icon: "❄️" },
    { value: "otros", label: "Otros", icon: "🛠️" },
  ];

  const topProviders = filteredProviders?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-innovation p-8 rounded-2xl shadow-xl text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Encuentra Profesionales de Confianza
          </h1>
          <p className="text-lg text-white/90 mb-6">
            Más de {providers?.length || 0} proveedores verificados con valoraciones reales de tu comunidad
          </p>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Busca por nombre, servicio o especialidad..."
              className="pl-12 h-14 text-lg bg-white border-0 shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-providers"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Categorías
        </h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              className="h-auto py-3 px-4 rounded-xl hover-elevate active-elevate-2"
              onClick={() => setSelectedCategory(cat.value)}
              data-testid={`filter-category-${cat.value}`}
            >
              <span className="mr-2 text-lg">{cat.icon}</span>
              <span className="font-medium">{cat.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Ordenar por:</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={sortBy === "rating" ? "default" : "ghost"}
            onClick={() => setSortBy("rating")}
            className="rounded-lg"
          >
            <Star className="w-4 h-4 mr-1" />
            Mejor Valorados
          </Button>
          <Button
            size="sm"
            variant={sortBy === "jobs" ? "default" : "ghost"}
            onClick={() => setSortBy("jobs")}
            className="rounded-lg"
          >
            <Award className="w-4 h-4 mr-1" />
            Más Trabajos
          </Button>
        </div>
      </div>

      {/* Top Providers Highlight */}
      {topProviders.length > 0 && selectedCategory === "all" && !searchQuery && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent" />
            Proveedores Destacados
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {topProviders.map((provider, index) => (
              <Card 
                key={provider.id} 
                className="relative overflow-hidden border-2 border-primary/20 hover-elevate shadow-lg transition-all duration-300"
                data-testid={`card-featured-provider-${provider.id}`}
              >
                {/* Top Badge */}
                <div className="absolute top-3 right-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  #{index + 1}
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                      <AvatarImage src={provider.logoUrl || undefined} />
                      <AvatarFallback className="text-2xl bg-primary text-white">
                        {provider.companyName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <CardTitle className="text-xl">{provider.companyName}</CardTitle>
                        {provider.isVerified && <VerifiedBadge showLabel={false} />}
                      </div>
                      <Badge variant="secondary" className="mb-3">
                        {getCategoryLabel(provider.category as any)}
                      </Badge>
                      <div className="flex items-center justify-center gap-1">
                        <StarRating
                          rating={parseFloat(provider.averageRating || "0")}
                          size="lg"
                          showNumber={true}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {provider.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 text-center">
                      {provider.description}
                    </p>
                  )}
                  <div className="flex justify-around text-center border-t pt-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">{provider.totalJobs || 0}</div>
                      <div className="text-xs text-muted-foreground">Trabajos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-success">{provider.totalRatings || 0}</div>
                      <div className="text-xs text-muted-foreground">Valoraciones</div>
                    </div>
                  </div>
                  <Link href={`/proveedores/${provider.id}`}>
                    <Button className="w-full mt-4 bg-primary hover:bg-primary/90" size="lg">
                      Ver Perfil
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Providers Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {searchQuery || selectedCategory !== "all" ? "Resultados" : "Todos los Proveedores"}
          <span className="text-muted-foreground font-normal text-lg ml-2">
            ({filteredProviders?.length || 0})
          </span>
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredProviders && filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <Link key={provider.id} href={`/proveedores/${provider.id}`}>
                <Card 
                  className="hover-elevate active-elevate-2 transition-all duration-200 border-border/60 hover:border-primary/30 hover:shadow-lg cursor-pointer"
                  data-testid={`card-provider-${provider.id}`}
                >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-border">
                      <AvatarImage src={provider.logoUrl || undefined} />
                      <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/80 text-white">
                        {provider.companyName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <CardTitle className="text-lg line-clamp-1">{provider.companyName}</CardTitle>
                        {provider.isVerified && <VerifiedBadge showLabel={false} />}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon category={provider.category as any} />
                        <span className="text-sm text-muted-foreground">
                          {getCategoryLabel(provider.category as any)}
                        </span>
                      </div>
                      <StarRating
                        rating={parseFloat(provider.averageRating || "0")}
                        size="sm"
                        showNumber={true}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {provider.description && (
                    <CardDescription className="line-clamp-2">
                      {provider.description}
                    </CardDescription>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Award className="w-3.5 h-3.5" />
                      <span className="font-medium">{provider.totalJobs || 0}</span>
                      <span>trabajos</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-medium">{provider.totalRatings || 0}</span>
                      <span>valoraciones</span>
                    </div>
                  </div>
                  
                  {provider.avgResponseTime && (
                    <div className="flex items-center gap-1.5 text-xs text-success">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium">
                        Responde en ~{Math.round(provider.avgResponseTime / 60)}h
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
              </Link>
            ))
          ) : (
            <Card className="col-span-full border-dashed">
              <CardContent className="py-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-medium text-muted-foreground mb-2">
                  No se encontraron proveedores
                </p>
                <p className="text-sm text-muted-foreground">
                  Intenta con otros términos de búsqueda o categorías
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
