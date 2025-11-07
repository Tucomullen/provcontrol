import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function VerifiedBadge({ className, showLabel = true }: VerifiedBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="default" 
          className={`bg-chart-2 hover:bg-chart-2/90 ${className}`}
          data-testid="badge-verified"
        >
          <ShieldCheck className="w-3 h-3 mr-1" />
          {showLabel && "Verificado"}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">
          Calificación verificada vinculada a incidencia real, presupuesto aprobado y factura validada.
        </p>
      </TooltipContent>
    </Tooltip>
  );
}