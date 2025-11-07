import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Budget, Provider, Incident } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { getCategoryLabel } from "@/components/CategoryIcon";

export default function Budgets() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: budgets, isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: providers } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  const { data: incidents } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const filteredBudgets = budgets?.filter((budget) => {
    const provider = providers?.find((p) => p.id === budget.providerId);
    const incident = incidents?.find((i) => i.id === budget.incidentId);
    return (
      budget.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider?.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident?.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const groupedBudgets = filteredBudgets?.reduce((acc, budget) => {
    const incidentId = budget.incidentId;
    if (!acc[incidentId]) {
      acc[incidentId] = [];
    }
    acc[incidentId].push(budget);
    return acc;
  }, {} as Record<string, Budget[]>);

  const getComparisonIcon = (budget: Budget, budgetGroup: Budget[]) => {
    const sortedByPrice = [...budgetGroup].sort((a, b) => parseFloat(a.totalCost) - parseFloat(b.totalCost));
    const minPrice = parseFloat(sortedByPrice[0].totalCost);
    const maxPrice = parseFloat(sortedByPrice[sortedByPrice.length - 1].totalCost);
    const currentPrice = parseFloat(budget.totalCost);

    if (currentPrice === minPrice) return <TrendingDown className="w-4 h-4 text-chart-2" />;
    if (currentPrice === maxPrice) return <TrendingUp className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Comparativa de Presupuestos</h1>
        <p className="text-muted-foreground">
          Compara ofertas de diferentes proveedores para cada incidencia
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar presupuestos..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-budgets"
        />
      </div>

      <div className="space-y-8">
        {budgetsLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Cargando presupuestos...
            </CardContent>
          </Card>
        ) : groupedBudgets && Object.keys(groupedBudgets).length > 0 ? (
          Object.entries(groupedBudgets).map(([incidentId, budgetGroup]) => {
            const incident = incidents?.find((i) => i.id === incidentId);
            if (!incident) return null;

            return (
              <div key={incidentId} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{incident.title}</h2>
                    <p className="text-sm text-muted-foreground capitalize">
                      {getCategoryLabel(incident.category as any)} • {incident.location}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {budgetGroup.length} presupuesto{budgetGroup.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {budgetGroup.map((budget) => {
                    const provider = providers?.find((p) => p.id === budget.providerId);
                    if (!provider) return null;

                    return (
                      <Card key={budget.id} className="hover-elevate" data-testid={`card-budget-${budget.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={provider.logoUrl || undefined} />
                                <AvatarFallback className="text-sm">
                                  {provider.companyName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base truncate">
                                  {provider.companyName}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                  {provider.totalJobs || 0} trabajos
                                </p>
                              </div>
                            </div>
                            {getComparisonIcon(budget, budgetGroup)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-foreground">
                                {parseFloat(budget.totalCost).toLocaleString("es-ES", {
                                  style: "currency",
                                  currency: "EUR",
                                })}
                              </span>
                            </div>

                            <CardDescription className="line-clamp-2">
                              {budget.description}
                            </CardDescription>

                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              {budget.estimatedDays && (
                                <span>{budget.estimatedDays} días estimados</span>
                              )}
                              {budget.isApproved && (
                                <Badge variant="default" className="text-xs">
                                  Aprobado
                                </Badge>
                              )}
                            </div>

                            {budget.lineItems && budget.lineItems.length > 0 && (
                              <div className="pt-2 border-t border-border">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Partidas ({budget.lineItems.length})
                                </p>
                                <div className="space-y-1">
                                  {budget.lineItems.slice(0, 2).map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-xs">
                                      <span className="text-muted-foreground truncate">
                                        {item.item} (x{item.quantity})
                                      </span>
                                      <span className="font-medium">
                                        {item.total.toLocaleString("es-ES", {
                                          style: "currency",
                                          currency: "EUR",
                                        })}
                                      </span>
                                    </div>
                                  ))}
                                  {budget.lineItems.length > 2 && (
                                    <p className="text-xs text-muted-foreground">
                                      +{budget.lineItems.length - 2} partidas más
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay presupuestos disponibles</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}