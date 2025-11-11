import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Building2, MapPin, Users, FileText, CheckCircle2, ArrowLeft, ArrowRight, UserPlus, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

type Step = 1 | 2 | 3 | 4 | 5;

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface CommunityFormData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  totalUnits: string;
  description: string;
  logoUrl: string | null;
}

export default function CreateCommunity() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refetch: refetchUser } = useAuth();
  
  // Restaurar el paso desde localStorage si existe, para evitar perder el progreso
  const getInitialStep = (): Step => {
    const savedStep = localStorage.getItem('onboarding-community-step');
    return savedStep ? (parseInt(savedStep, 10) as Step) : 1;
  };
  
  const [step, setStep] = useState<Step>(getInitialStep());
  
  // Guardar el paso en localStorage cuando cambie
  const updateStep = (newStep: Step) => {
    setStep(newStep);
    localStorage.setItem('onboarding-community-step', newStep.toString());
  };
  
  // Limpiar el paso guardado cuando se complete el onboarding
  const clearSavedStep = () => {
    localStorage.removeItem('onboarding-community-step');
  };
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [formData, setFormData] = useState<CommunityFormData>({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    totalUnits: "",
    description: "",
    logoUrl: null,
  });
  const [slugPreview, setSlugPreview] = useState("");

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: "presidente", // Rol fijo para creadores de comunidad
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar usuario");
      }
      return response.json();
    },
    onSuccess: async () => {
      // No hacer refetch inmediatamente para evitar que el componente se desmonte
      // El refetch se hará cuando sea necesario (al completar el onboarding)
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Continúa con la información de tu comunidad.",
      });
      updateStep(2); // Avanzar al siguiente paso
    },
    onError: (error: any) => {
      toast({
        title: "Error al registrar",
        description: error.message || "Por favor, intenta de nuevo",
        variant: "destructive",
      });
    },
  });

  const createCommunityMutation = useMutation({
    mutationFn: async (data: CommunityFormData) => {
      // Convertir totalUnits a número y preparar los datos para el servidor
      const payload = {
        name: data.name,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        totalUnits: parseInt(data.totalUnits, 10),
        description: data.description || null,
        logoUrl: data.logoUrl || null,
      };
      
      const response = await apiRequest("POST", "/api/onboarding/community", payload);
      return await response.json();
    },
    onSuccess: async () => {
      clearSavedStep(); // Limpiar el paso guardado
      await refetchUser(); // Ahora sí refetch para actualizar el estado de autenticación
      toast({
        title: "¡Comunidad creada!",
        description: "Tu comunidad ha sido creada exitosamente.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      console.error("Error creating community:", error);
      // El error ya viene con el mensaje correcto desde apiRequest
      const errorMessage = error.message || error.data?.message || "Por favor, intenta de nuevo";
      
      toast({
        title: "Error al crear comunidad",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Generar preview del slug
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleRegistrationChange = (field: keyof RegistrationData, value: string) => {
    setRegistrationData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: keyof CommunityFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "name") {
      setSlugPreview(generateSlug(value));
    }
  };

  const validateStep = (currentStep: Step): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          registrationData.email &&
          registrationData.password &&
          registrationData.confirmPassword &&
          registrationData.firstName &&
          registrationData.lastName &&
          registrationData.password === registrationData.confirmPassword &&
          registrationData.password.length >= 8
        );
      case 2:
        return !!(formData.name && formData.address && formData.city && formData.postalCode && formData.totalUnits);
      case 3:
        return true; // Logo es opcional
      case 4:
        return true; // Descripción es opcional
      case 5:
        return true; // Solo confirmación
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 1) {
      // Validar y registrar en paso 1
      if (!validateStep(1)) {
        if (registrationData.password !== registrationData.confirmPassword) {
          toast({
            title: "Error de validación",
            description: "Las contraseñas no coinciden",
            variant: "destructive",
          });
        } else if (registrationData.password.length < 8) {
          toast({
            title: "Error de validación",
            description: "La contraseña debe tener al menos 8 caracteres",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Campos requeridos",
            description: "Por favor, completa todos los campos requeridos",
            variant: "destructive",
          });
        }
        return;
      }
      // Registrar usuario
      registerMutation.mutate(registrationData);
      return;
    }

    if (!validateStep(step)) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    if (step < 5) {
      updateStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      updateStep((step - 1) as Step);
    }
  };

  const handleSubmit = () => {
    if (!validateStep(2)) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos requeridos de la comunidad",
        variant: "destructive",
      });
      return;
    }
    createCommunityMutation.mutate(formData);
  };

  const progress = ((step - 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-10 h-10 text-primary" />
            <span className="text-sm text-muted-foreground">Paso {step} de 5</span>
          </div>
          <Progress value={progress} className="h-2" />
          <CardTitle className="text-3xl text-center mt-4">
            {step === 1 && "Crea tu cuenta"}
            {step === 2 && "Información de tu Comunidad"}
            {step === 3 && "Logo de la Comunidad (Opcional)"}
            {step === 4 && "Descripción de la Comunidad (Opcional)"}
            {step === 5 && "Confirma los Datos de tu Comunidad"}
          </CardTitle>
          <CardDescription className="text-center mt-2">
            {step === 1 && "Comencemos creando tu cuenta como presidente de la comunidad."}
            {step === 2 && "Completa los detalles básicos de tu nueva comunidad."}
            {step === 3 && "Sube una imagen que represente a tu comunidad."}
            {step === 4 && "Añade una breve descripción para tu comunidad."}
            {step === 5 && "Revisa que todo esté correcto antes de finalizar."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Paso 1: Registro */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Como creador de la comunidad, serás automáticamente el presidente con permisos de administración.
                </p>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => handleRegistrationChange("email", e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full"
                  disabled={registerMutation.isPending}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    value={registrationData.firstName}
                    onChange={(e) => handleRegistrationChange("firstName", e.target.value)}
                    placeholder="Juan"
                    required
                    className="w-full"
                    disabled={registerMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    value={registrationData.lastName}
                    onChange={(e) => handleRegistrationChange("lastName", e.target.value)}
                    placeholder="Pérez"
                    required
                    className="w-full"
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={registrationData.password}
                  onChange={(e) => handleRegistrationChange("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full"
                  disabled={registerMutation.isPending}
                />
                <p className="text-xs text-muted-foreground mt-1">Mínimo 8 caracteres</p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={registrationData.confirmPassword}
                  onChange={(e) => handleRegistrationChange("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full"
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>
          )}

          {/* Paso 2: Información básica */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la Comunidad *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ej: Comunidad de Vecinos 'El Jardín'"
                  required
                  className="w-full"
                />
                {slugPreview && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Slug de la comunidad: <span className="font-semibold">{slugPreview}</span>
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Ej: Calle Falsa, 123"
                  required
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Ej: Madrid"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Código Postal *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    placeholder="Ej: 28001"
                    required
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="totalUnits">Número Total de Unidades/Pisos *</Label>
                <Input
                  id="totalUnits"
                  type="number"
                  value={formData.totalUnits}
                  onChange={(e) => handleInputChange("totalUnits", e.target.value)}
                  placeholder="50"
                  min="1"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Paso 3: Logo */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Sube un logo para tu comunidad. Esto ayudará a identificarla fácilmente.
                </p>
                <ObjectUploader
                  onGetUploadParameters={async () => {
                    try {
                      console.log("Fetching upload parameters...");
                      const response = await fetch("/api/objects/upload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                      });
                      console.log("Upload parameters response status:", response.status);
                      if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Failed to get upload URL: ${response.status} - ${errorText}`);
                      }
                      const data = await response.json();
                      console.log("Upload parameters data:", data);
                      const uploadURL = data.uploadURL;
                      if (!uploadURL) {
                        throw new Error("No uploadURL in response");
                      }
                      return { method: "PUT" as const, url: uploadURL };
                    } catch (error) {
                      console.error("Error getting upload parameters:", error);
                      throw error;
                    }
                  }}
                  onComplete={(result: any) => {
                    console.log("Upload complete result:", result);
                    const url = result.successful?.[0]?.uploadURL;
                    if (url) {
                      handleInputChange("logoUrl", url);
                      toast({
                        title: "Logo subido",
                        description: "El logo se ha subido correctamente",
                      });
                    } else {
                      console.error("No URL in upload result:", result);
                      toast({
                        title: "Error",
                        description: "No se pudo obtener la URL del archivo subido",
                        variant: "destructive",
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

          {/* Paso 4: Descripción */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe tu comunidad, características especiales, etc."
                  rows={6}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Esta descripción será visible para los miembros de la comunidad
                </p>
              </div>
            </div>
          )}

          {/* Paso 5: Confirmación */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Building2 className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Nombre</p>
                    <p className="text-sm text-muted-foreground">{formData.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <MapPin className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Dirección</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.address}, {formData.postalCode} {formData.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Users className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Unidades</p>
                    <p className="text-sm text-muted-foreground">{formData.totalUnits} unidades</p>
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
                    <p className="font-medium text-sm">Serás el presidente de la comunidad</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Como creador, tendrás permisos de administración para gestionar la comunidad.
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
              disabled={step === 1 || registerMutation.isPending || createCommunityMutation.isPending}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            {step < 5 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={registerMutation.isPending || createCommunityMutation.isPending}
              >
                {step === 1 && registerMutation.isPending ? "Registrando..." : "Siguiente"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={createCommunityMutation.isPending}
              >
                {createCommunityMutation.isPending ? "Creando..." : "Crear Comunidad"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
