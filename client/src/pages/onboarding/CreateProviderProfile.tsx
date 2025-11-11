import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Briefcase, Building2, Phone, Globe, FileText, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Step = 1 | 2 | 3 | 4;

interface ProviderFormData {
  companyName: string;
  category: string;
  description: string;
  phone: string;
  website: string;
  logoUrl: string | null;
}

const PROVIDER_CATEGORIES = [
  { value: "fontaneria", label: "Fontanería" },
  { value: "electricidad", label: "Electricidad" },
  { value: "carpinteria", label: "Carpintería" },
  { value: "pintura", label: "Pintura" },
  { value: "jardineria", label: "Jardinería" },
  { value: "limpieza", label: "Limpieza" },
  { value: "seguridad", label: "Seguridad" },
  { value: "ascensores", label: "Ascensores" },
  { value: "calefaccion", label: "Calefacción" },
  { value: "aire_acondicionado", label: "Aire Acondicionado" },
  { value: "albañileria", label: "Albañilería" },
  { value: "cerrajeria", label: "Cerrajería" },
  { value: "cristaleria", label: "Cristalería" },
  { value: "impermeabilizacion", label: "Impermeabilización" },
  { value: "otros", label: "Otros" },
];

export default function CreateProviderProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<ProviderFormData>({
    companyName: "",
    category: "",
    description: "",
    phone: "",
    website: "",
    logoUrl: null,
  });

  const createProviderMutation = useMutation({
    mutationFn: async (data: ProviderFormData) => {
      return await apiRequest("POST", "/api/providers", {
        companyName: data.companyName,
        category: data.category,
        description: data.description || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        logoUrl: data.logoUrl || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Perfil creado!",
        description: "Tu perfil de proveedor ha sido creado exitosamente.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear perfil",
        description: error.message || "Por favor, intenta de nuevo",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof ProviderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (currentStep: Step): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.companyName && formData.category);
      case 2:
        return true; // Logo es opcional
      case 3:
        return true; // Descripción y contacto son opcionales
      case 4:
        return true; // Solo confirmación
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    if (step < 4) {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = () => {
    if (!validateStep(1)) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa al menos el nombre de la empresa y la categoría",
        variant: "destructive",
      });
      return;
    }
    createProviderMutation.mutate(formData);
  };

  const progress = ((step - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Briefcase className="w-10 h-10 text-primary" />
            <span className="text-sm text-muted-foreground">Paso {step} de 4</span>
          </div>
          <Progress value={progress} className="h-2" />
          <CardTitle className="text-3xl text-center mt-4">
            {step === 1 && "Información de tu Empresa"}
            {step === 2 && "Logo de la Empresa (Opcional)"}
            {step === 3 && "Descripción y Contacto (Opcional)"}
            {step === 4 && "Confirma los Datos de tu Perfil"}
          </CardTitle>
          <CardDescription className="text-center mt-2">
            {step === 1 && "Completa la información básica de tu empresa o negocio."}
            {step === 2 && "Sube un logo para tu empresa. Esto ayudará a identificarte fácilmente."}
            {step === 3 && "Añade una descripción y datos de contacto para que las comunidades te conozcan mejor."}
            {step === 4 && "Revisa que todo esté correcto antes de finalizar."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Paso 1: Información básica */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder="Ej: Fontanería García S.L."
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Paso 2: Logo */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Sube un logo para tu empresa. Esto ayudará a identificarte fácilmente.
                </p>
                <ObjectUploader
                  onGetUploadParameters={async () => {
                    const response = await fetch("/api/objects/upload", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                    });
                    const { uploadURL } = await response.json();
                    return { method: "PUT" as const, url: uploadURL };
                  }}
                  onComplete={(result: any) => {
                    const url = result.successful?.[0]?.uploadURL;
                    if (url) {
                      handleInputChange("logoUrl", url);
                      toast({
                        title: "Logo subido",
                        description: "El logo se ha subido correctamente",
                      });
                    }
                  }}
                  maxNumberOfFiles={1}
                  maxFileSize={5 * 1024 * 1024}
                >
                  <Button type="button" variant="outline">
                    Subir Logo
                  </Button>
                </ObjectUploader>
                {formData.logoUrl && (
                  <div className="mt-4">
                    <img src={formData.logoUrl} alt="Logo" className="w-32 h-32 mx-auto object-contain rounded" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paso 3: Descripción y contacto */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe tu empresa, servicios que ofreces, años de experiencia, etc."
                  rows={6}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Esta descripción será visible para las comunidades
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono (Opcional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Sitio Web (Opcional)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://www.tuempresa.com"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Building2 className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Nombre de la Empresa</p>
                    <p className="text-sm text-muted-foreground">{formData.companyName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Briefcase className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Categoría</p>
                    <p className="text-sm text-muted-foreground">
                      {PROVIDER_CATEGORIES.find((c) => c.value === formData.category)?.label || formData.category}
                    </p>
                  </div>
                </div>

                {formData.description && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <FileText className="w-5 h-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Descripción</p>
                      <p className="text-sm text-muted-foreground">{formData.description}</p>
                    </div>
                  </div>
                )}

                {(formData.phone || formData.website) && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Phone className="w-5 h-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Contacto</p>
                      {formData.phone && (
                        <p className="text-sm text-muted-foreground">Tel: {formData.phone}</p>
                      )}
                      {formData.website && (
                        <p className="text-sm text-muted-foreground">Web: {formData.website}</p>
                      )}
                    </div>
                  </div>
                )}

                {formData.logoUrl && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Logo</p>
                      <img src={formData.logoUrl} alt="Logo" className="w-24 h-24 mt-2 object-contain rounded" />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Tu perfil será visible para las comunidades</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Las comunidades podrán contactarte y solicitar presupuestos para sus incidencias.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || createProviderMutation.isPending}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            {step < 4 ? (
              <Button type="button" onClick={handleNext} disabled={createProviderMutation.isPending}>
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={createProviderMutation.isPending}
              >
                {createProviderMutation.isPending ? "Creando..." : "Crear Perfil"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

