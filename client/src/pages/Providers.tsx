import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon, getCategoryLabel } from "@/components/CategoryIcon";
import { StarRating } from "@/components/StarRating";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { Provider } from "@shared/schema";

export default function Providers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: providers, isLoading } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  const filteredProviders = providers?.filter((provider) => {
    const matchesSearch =
      provider.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "Todas" },
    { value: "fontaneria", label: "Fontanería" },
    { value: "electricidad", label: "Electricidad" },
    { value: "albanileria", label: "Albañilería" },
    { value: "jardineria", label: "Jardinería" },
    { value: "pintura", label: "Pintura" },
    { value: "carpinteria", label: "Carpintería" },
    { value: "limpieza", label: "Limpieza" },
    { value: "cerrajeria", label: "Cerrajería" },
    { value: "climatizacion", label: "Climatización" },
    { value: "otros", label: "Otros" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Directorio de Proveedores</h1>
        <p className="text-muted-foreground">
          Encuentra profesionales verificados con calificaciones reales
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proveedores..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-providers"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat.value}
            variant={selectedCategory === cat.value ? "default" : "outline"}
            className="cursor-pointer hover-elevate"
            onClick={() => setSelectedCategory(cat.value)}
            data-testid={`filter-category-${cat.value}`}
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              Cargando proveedores...
            </CardContent>
          </Card>
        ) : filteredProviders && filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => (
            <Card key={provider.id} className="hover-elevate" data-testid={`card-provider-${provider.id}`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={provider.logoUrl || undefined} />
                    <AvatarFallback className="text-lg">
                      {provider.companyName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <CardTitle className="text-lg truncate">{provider.companyName}</CardTitle>
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
              <CardContent className="pt-0">
                {provider.description && (
                  <CardDescription className="line-clamp-2 mb-3">
                    {provider.description}
                  </CardDescription>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{provider.totalJobs || 0} trabajos</span>
                  <span>• {provider.totalRatings || 0} valoraciones</span>
                  {provider.avgResponseTime && (
                    <span>• {Math.round(provider.avgResponseTime / 60)}h respuesta</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No se encontraron proveedores{selectedCategory !== "all" && " en esta categoría"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}