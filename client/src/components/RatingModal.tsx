import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, X, ChevronRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Provider, Incident } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { Rating } from "@shared/schema";

const ratingSchema = z.object({
  incidentId: z.string(),
  providerId: z.string(),
  ratedById: z.string(),
  communityId: z.string(),
  authorizedByPresidentId: z.string(),
  budgetId: z.string(),
  qualityRating: z.number().min(1).max(5),
  timelinessRating: z.number().min(1).max(5),
  budgetAdherenceRating: z.number().min(1).max(5),
  comment: z.string().min(10, "El comentario debe tener al menos 10 caracteres"),
  photoUrls: z.array(z.string()).optional(),
  overallRating: z.number(),
});

type RatingFormData = z.infer<typeof ratingSchema>;

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider;
  incident: Incident;
}

export function RatingModal({ open, onOpenChange, provider, incident }: RatingModalProps) {
  const [step, setStep] = useState<'ratings' | 'details'>('ratings');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      incidentId: incident.id,
      providerId: provider.id,
      ratedById: "", // Will be filled by backend
      communityId: "", // Will be filled by backend
      authorizedByPresidentId: "", // Will be filled by backend
      budgetId: incident.approvedBudgetId || "",
      qualityRating: 0,
      timelinessRating: 0,
      budgetAdherenceRating: 0,
      comment: "",
      photoUrls: [],
      overallRating: 0,
    },
  });

  const createRatingMutation = useMutation({
    mutationFn: async (data: RatingFormData) => {
      return apiRequest("POST", "/api/ratings", { ...data, photoUrls });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ratings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({
        title: "¡Valoración publicada!",
        description: "Tu reseña ha sido compartida con la comunidad",
      });
      onOpenChange(false);
      form.reset();
      setStep('ratings');
      setPhotoUrls([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RatingFormData) => {
    // Calculate overall rating before submitting
    const overall = Math.round(
      (data.qualityRating + data.timelinessRating + data.budgetAdherenceRating) / 3
    );
    createRatingMutation.mutate({ ...data, overallRating: overall, photoUrls });
  };

  const canContinue = () => {
    const values = form.getValues();
    return values.qualityRating > 0 && 
           values.timelinessRating > 0 && 
           values.budgetAdherenceRating > 0;
  };

  const overallRating = (
    (form.watch('qualityRating') + 
     form.watch('timelinessRating') + 
     form.watch('budgetAdherenceRating')) / 3
  ).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Star className="w-6 h-6 text-accent" />
            Valorar Proveedor
          </DialogTitle>
          <DialogDescription>
            Comparte tu experiencia con la comunidad
          </DialogDescription>
        </DialogHeader>

        {/* Provider Info */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20">
            <AvatarImage src={provider.logoUrl || undefined} />
            <AvatarFallback className="bg-primary text-white text-xl">
              {provider.companyName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{provider.companyName}</h3>
            <p className="text-sm text-muted-foreground">{incident.title}</p>
            <Badge variant="outline" className="mt-1">
              {provider.category}
            </Badge>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 'ratings' && (
              <>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {overallRating}
                  </div>
                  <p className="text-sm text-muted-foreground">Puntuación General</p>
                </div>

                {/* Rating Categories */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="qualityRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          <span>Calidad del Trabajo</span>
                          <span className="text-primary font-bold">{field.value || 0}/5</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => field.onChange(rating)}
                                className="flex-1"
                                data-testid={`rating-quality-${rating}`}
                              >
                                <Star
                                  className={`w-10 h-10 transition-all ${
                                    rating <= field.value
                                      ? "fill-accent text-accent scale-110"
                                      : "text-muted-foreground hover:text-accent/50"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timelinessRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          <span>Puntualidad</span>
                          <span className="text-primary font-bold">{field.value || 0}/5</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => field.onChange(rating)}
                                className="flex-1"
                                data-testid={`rating-timeliness-${rating}`}
                              >
                                <Star
                                  className={`w-10 h-10 transition-all ${
                                    rating <= field.value
                                      ? "fill-accent text-accent scale-110"
                                      : "text-muted-foreground hover:text-accent/50"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budgetAdherenceRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          <span>Adherencia al Presupuesto</span>
                          <span className="text-primary font-bold">{field.value || 0}/5</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => field.onChange(rating)}
                                className="flex-1"
                                data-testid={`rating-budget-${rating}`}
                              >
                                <Star
                                  className={`w-10 h-10 transition-all ${
                                    rating <= field.value
                                      ? "fill-accent text-accent scale-110"
                                      : "text-muted-foreground hover:text-accent/50"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  disabled={!canContinue()}
                  onClick={() => setStep('details')}
                  data-testid="button-continue-to-details"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {step === 'details' && (
              <>
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuéntanos tu experiencia</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="¿Qué tal fue tu experiencia con este proveedor? Comparte detalles que puedan ayudar a otros propietarios..."
                          className="min-h-32 resize-none"
                          {...field}
                          data-testid="input-comment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Fotos del Trabajo (Opcional)</FormLabel>
                  <p className="text-sm text-muted-foreground mb-3">
                    Añade fotos para dar más credibilidad a tu valoración
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
                    onComplete={(urls: string[]) => {
                      setPhotoUrls([...photoUrls, ...urls]);
                    }}
                    maxNumberOfFiles={5}
                    maxFileSize={10 * 1024 * 1024}
                  >
                    <Button type="button" variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Fotos
                    </Button>
                  </ObjectUploader>

                  {photoUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {photoUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-border"
                          />
                          <button
                            type="button"
                            onClick={() => setPhotoUrls(photoUrls.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('ratings')}
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    disabled={createRatingMutation.isPending}
                    data-testid="button-submit-rating"
                  >
                    {createRatingMutation.isPending ? "Publicando..." : "Publicar Valoración"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
