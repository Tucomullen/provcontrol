import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, Flag, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Rating } from "@shared/schema";

interface RatingCardProps {
  rating: Rating;
  providerName?: string;
  showProviderInfo?: boolean;
}

export function RatingCard({ rating, providerName, showProviderInfo = true }: RatingCardProps) {
  const categoryScores = [
    { label: "Calidad", value: rating.qualityRating },
    { label: "Puntualidad", value: rating.timelinessRating },
    { label: "Adherencia Presupuesto", value: rating.budgetAdherenceRating },
  ];

  return (
    <Card className="hover-elevate shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12 ring-2 ring-border">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-primary text-white">
                CP
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold">Comunidad Propietario</p>
                <Badge variant="outline" className="text-xs">Verificado</Badge>
              </div>
              {showProviderInfo && providerName && (
                <p className="text-sm text-muted-foreground mb-1">
                  Valoró a <span className="font-medium text-foreground">{providerName}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {rating.createdAt && formatDistanceToNow(new Date(rating.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 bg-accent/10 px-3 py-1 rounded-full">
              <Star className="w-5 h-5 fill-accent text-accent" />
              <span className="font-bold text-lg text-accent">{rating.overallRating}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {categoryScores.map((score) => (
            <div key={score.label} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">{score.label}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-accent text-accent" />
                <span className="text-sm font-medium">{score.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Comment */}
        <div>
          <p className="text-foreground leading-relaxed">{rating.comment}</p>
        </div>

        {/* Photos */}
        {rating.photoUrls && rating.photoUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {rating.photoUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={url}
                  alt={`Rating photo ${index + 1}`}
                  className="object-cover w-full h-full hover:scale-110 transition-transform cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}

        {/* Provider Reply */}
        {rating.providerReply && (
          <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-l-primary">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-primary">Respuesta del Proveedor</p>
            </div>
            <p className="text-sm text-foreground">{rating.providerReply}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3 border-t">
          <Button variant="ghost" size="sm" className="hover-elevate" data-testid="button-rating-helpful">
            <ThumbsUp className="w-4 h-4 mr-1" />
            Útil
          </Button>
          <Button variant="ghost" size="sm" className="hover-elevate" data-testid="button-rating-comment">
            <MessageSquare className="w-4 h-4 mr-1" />
            Comentar
          </Button>
          <Button variant="ghost" size="sm" className="hover-elevate text-muted-foreground" data-testid="button-rating-report">
            <Flag className="w-4 h-4 mr-1" />
            Reportar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
