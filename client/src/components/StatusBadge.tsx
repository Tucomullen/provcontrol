import { Badge } from "@/components/ui/badge";
import { CircleDot, Clock, CheckCircle, PlayCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "abierta" | "presupuestada" | "aprobada" | "en_curso" | "resuelta";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    abierta: {
      label: "Abierta",
      icon: AlertCircle,
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    presupuestada: {
      label: "Presupuestada",
      icon: CircleDot,
      className: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    },
    aprobada: {
      label: "Aprobada",
      icon: CheckCircle,
      className: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    },
    en_curso: {
      label: "En Curso",
      icon: PlayCircle,
      className: "bg-chart-5/10 text-chart-5 border-chart-5/20",
    },
    resuelta: {
      label: "Resuelta",
      icon: CheckCircle,
      className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} ${className}`} data-testid={`badge-status-${status}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}