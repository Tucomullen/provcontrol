import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  FileText,
  CheckCircle,
  Clock,
  Euro,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryIcon, getCategoryLabel } from "@/components/CategoryIcon";
import type { Incident, Budget, IncidentUpdate, Provider, User as UserType } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function IncidentDetail() {
  const [, params] = useRoute("/incidencias/:id");
  const [, setLocation] = useLocation();
  const incidentId = params?.id;

  const { data: incident, isLoading: loadingIncident } = useQuery<Incident>({
    queryKey: ["/api/incidents", incidentId],
    enabled: !!incidentId,
  });

  const { data: budgets } = useQuery<Budget[]>({
    queryKey: ["/api/budgets", { incidentId }],
    queryFn: () => fetch(`/api/budgets?incidentId=${incidentId}`).then(res => res.json()),
    enabled: !!incidentId,
  });

  const { data: updates } = useQuery<IncidentUpdate[]>({
    queryKey: ["/api/incident-updates", incidentId],
    enabled: !!incidentId,
  });

  const { data: assignedProvider } = useQuery<Provider>({
    queryKey: ["/api/providers", incident?.assignedProviderId],
    enabled: !!incident?.assignedProviderId,
  });

  const approvedBudget = budgets?.find(b => b.id === incident?.approvedBudgetId);

  if (loadingIncident) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground" />
        <p className="text-muted-foreground">Incidencia no encontrada</p>
        <Button onClick={() => setLocation("/incidencias")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Incidencias
        </Button>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/incidencias")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-incident-title">
              {incident.title}
            </h1>
            <StatusBadge status={incident.status} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CategoryIcon category={incident.category} className="w-4 h-4" />
              <span>{getCategoryLabel(incident.category)}</span>
            </div>
            {incident.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{incident.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {incident.createdAt && formatDistanceToNow(new Date(incident.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-description">
                {incident.description}
              </p>
              {incident.photoUrls && incident.photoUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {incident.photoUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Foto ${index + 1}`}
                      className="rounded-lg border border-border w-full h-40 object-cover"
                      data-testid={`img-incident-photo-${index}`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budgets Comparison */}
          {budgets && budgets.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Comparativa de Presupuestos
                    </CardTitle>
                    <CardDescription>
                      {budgets.length} {budgets.length === 1 ? 'presupuesto recibido' : 'presupuestos recibidos'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgets.map((budget) => (
                  <Card
                    key={budget.id}
                    className={`${budget.id === approvedBudget?.id ? 'border-2 border-success' : ''}`}
                    data-testid={`card-budget-${budget.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">Proveedor</CardTitle>
                            {budget.id === approvedBudget?.id && (
                              <Badge className="bg-success text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aprobado
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{budget.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {parseFloat(budget.totalCost).toFixed(2)}€
                          </div>
                          {budget.estimatedDays && (
                            <div className="text-sm text-muted-foreground flex items-center justify-end gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {budget.estimatedDays} días
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {budget.lineItems && budget.lineItems.length > 0 && (
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Desglose:</p>
                          {budget.lineItems.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.item} ({item.quantity} x {item.unitPrice}€)
                              </span>
                              <span className="font-medium">{item.total}€</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {updates && updates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Historial de Actividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {updates.map((update, index) => (
                    <div key={update.id} className="flex gap-4" data-testid={`update-${index}`}>
                      <div className="flex flex-col items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusColor(update.status)}`}>
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        {index !== updates.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{getStatusLabel(update.status)}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {update.createdAt && formatDistanceToNow(new Date(update.createdAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                        {update.comment && (
                          <p className="text-sm text-muted-foreground mt-2">{update.comment}</p>
                        )}
                        {update.photoUrls && update.photoUrls.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {update.photoUrls.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`Actualización ${idx + 1}`}
                                className="rounded border border-border w-full h-24 object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Provider */}
          {assignedProvider && (
            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation(`/proveedores/${assignedProvider.id}`)} data-testid="card-assigned-provider">
              <CardHeader>
                <CardTitle className="text-lg">Proveedor Asignado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={assignedProvider.logoUrl || undefined} />
                    <AvatarFallback className="bg-primary text-white">
                      {assignedProvider.companyName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{assignedProvider.companyName}</p>
                    {assignedProvider.phone && (
                      <p className="text-sm text-muted-foreground">{assignedProvider.phone}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Cost Summary */}
          {incident.status === "resuelta" && incident.finalCost && (
            <Card className="border-l-4 border-l-verified">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Euro className="w-5 h-5" />
                  Resumen Final
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Costo Final:</span>
                  <span className="text-2xl font-bold text-primary">
                    {parseFloat(incident.finalCost).toFixed(2)}€
                  </span>
                </div>
                {incident.finalInvoiceUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={incident.finalInvoiceUrl} target="_blank" rel="noopener noreferrer" data-testid="link-invoice">
                      Ver Factura
                    </a>
                  </Button>
                )}
                {incident.resolvedAt && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Resuelta {formatDistanceToNow(new Date(incident.resolvedAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <StatusBadge status={incident.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Categoría:</span>
                <Badge variant="outline">{getCategoryLabel(incident.category)}</Badge>
              </div>
              {budgets && budgets.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Presupuestos:</span>
                  <span className="font-medium">{budgets.length}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
