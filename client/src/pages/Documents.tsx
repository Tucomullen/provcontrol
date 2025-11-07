import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, FileText, Download, File } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { Document } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Documents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
  });
  const [fileUrl, setFileUrl] = useState("");

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { fileUrl: string }) => {
      return await apiRequest("POST", "/api/documents", {
        ...data,
        communityId: user?.communityId || "",
        uploadedById: user?.id || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Documento subido correctamente" });
      setDialogOpen(false);
      setFormData({ title: "", category: "", description: "" });
      setFileUrl("");
    },
    onError: () => {
      toast({ title: "Error al subir documento", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !fileUrl) {
      toast({ title: "Completa todos los campos obligatorios", variant: "destructive" });
      return;
    }
    createMutation.mutate({ ...formData, fileUrl });
  };

  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "Todas" },
    { value: "actas", label: "Actas" },
    { value: "facturas", label: "Facturas" },
    { value: "presupuestos", label: "Presupuestos" },
    { value: "estatutos", label: "Estatutos" },
    { value: "contratos", label: "Contratos" },
    { value: "otros", label: "Otros" },
  ];

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
      setFileUrl(result.successful[0].uploadURL);
      toast({ title: "Archivo subido correctamente" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Documentos</h1>
          <p className="text-muted-foreground">Gestión documental de la comunidad</p>
        </div>

        {user?.role === "presidente" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload-document">
                <Plus className="w-4 h-4 mr-2" />
                Subir Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Subir Nuevo Documento</DialogTitle>
                <DialogDescription>
                  Sube actas, facturas, estatutos y otros documentos importantes
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Acta Junta General 2025"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    data-testid="input-document-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category" data-testid="select-document-category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actas">Actas</SelectItem>
                      <SelectItem value="facturas">Facturas</SelectItem>
                      <SelectItem value="presupuestos">Presupuestos</SelectItem>
                      <SelectItem value="estatutos">Estatutos</SelectItem>
                      <SelectItem value="contratos">Contratos</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    placeholder="Descripción opcional"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="input-document-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Archivo *</Label>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={20971520}
                    onGetUploadParameters={handleGetUploadParams}
                    onComplete={handleUploadComplete}
                  >
                    <File className="w-4 h-4 mr-2" />
                    {fileUrl ? "Archivo adjuntado ✓" : "Seleccionar archivo"}
                  </ObjectUploader>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || !fileUrl} data-testid="button-submit-document">
                    {createMutation.isPending ? "Subiendo..." : "Subir Documento"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-documents"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Cargando documentos...
            </CardContent>
          </Card>
        ) : filteredDocuments && filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover-elevate" data-testid={`card-document-${doc.id}`}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <FileText className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span className="capitalize">{doc.category}</span>
                        <span>•</span>
                        <span>{new Date(doc.createdAt!).toLocaleDateString()}</span>
                        {doc.fileSize && (
                          <>
                            <span>•</span>
                            <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" data-testid={`button-download-${doc.id}`}>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No hay documentos registrados</p>
              {user?.role === "presidente" && (
                <Button variant="outline" onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Subir primer documento
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}