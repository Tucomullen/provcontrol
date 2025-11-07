import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Image } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryIcon, getCategoryLabel } from "@/components/CategoryIcon";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { Incident } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Incidents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
  });
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const { data: incidents, isLoading } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { photoUrls: string[] }) => {
      return await apiRequest("POST", "/api/incidents", {
        ...data,
        communityId: user?.communityId || "",
        reportedById: user?.id || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({ title: "Incidencia creada correctamente" });
      setDialogOpen(false);
      setFormData({ title: "", description: "", category: "", location: "" });
      setPhotoUrls([]);
    },
    onError: () => {
      toast({ title: "Error al crear incidencia", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast({ title: "Completa todos los campos obligatorios", variant: "destructive" });
      return;
    }
    createMutation.mutate({ ...formData, photoUrls });
  };

  const filteredIncidents = incidents?.filter((incident) =>
    incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGetUploadParams = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const { uploadURL } = await response.json();
    return { method: "PUT" as const, url: uploadURL };
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const urls = result.successful.map((file: any) => file.uploadURL);
      setPhotoUrls((prev) => [...prev, ...urls]);
      toast({ title: `${result.successful.length} foto(s) subida(s)` });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Incidencias</h1>
          <p className="text-muted-foreground">Gestión de incidencias de la comunidad</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-incident">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Incidencia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reportar Nueva Incidencia</DialogTitle>
              <DialogDescription>
                Describe el problema con detalle y adjunta fotos si es posible
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Fuga de agua en portal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-incident-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el problema en detalle..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  data-testid="input-incident-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category" data-testid="select-incident-category">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fontaneria">Fontanería</SelectItem>
                    <SelectItem value="electricidad">Electricidad</SelectItem>
                    <SelectItem value="albanileria">Albañilería</SelectItem>
                    <SelectItem value="jardineria">Jardinería</SelectItem>
                    <SelectItem value="pintura">Pintura</SelectItem>
                    <SelectItem value="carpinteria">Carpintería</SelectItem>
                    <SelectItem value="limpieza">Limpieza</SelectItem>
                    <SelectItem value="cerrajeria">Cerrajería</SelectItem>
                    <SelectItem value="climatizacion">Climatización</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  placeholder="Ej: Portal 2, 3º A"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  data-testid="input-incident-location"
                />
              </div>

              <div className="space-y-2">
                <Label>Fotos del problema</Label>
                <ObjectUploader
                  maxNumberOfFiles={5}
                  maxFileSize={10485760}
                  onGetUploadParameters={handleGetUploadParams}
                  onComplete={handleUploadComplete}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Subir fotos ({photoUrls.length}/5)
                </ObjectUploader>
                {photoUrls.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {photoUrls.length} foto(s) adjuntada(s)
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-incident">
                  {createMutation.isPending ? "Creando..." : "Crear Incidencia"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar incidencias..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-incidents"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Cargando incidencias...
            </CardContent>
          </Card>
        ) : filteredIncidents && filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident) => (
            <Card key={incident.id} className="hover-elevate" data-testid={`card-incident-${incident.id}`}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{incident.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{incident.description}</CardDescription>
                  </div>
                  <StatusBadge status={incident.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CategoryIcon category={incident.category as any} />
                    <span>{getCategoryLabel(incident.category as any)}</span>
                  </div>
                  {incident.location && <span>• {incident.location}</span>}
                  <span>• {new Date(incident.createdAt!).toLocaleDateString()}</span>
                  {incident.photoUrls && incident.photoUrls.length > 0 && (
                    <span className="flex items-center gap-1">
                      • <Image className="w-3 h-3" /> {incident.photoUrls.length} foto(s)
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No hay incidencias registradas</p>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera incidencia
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}