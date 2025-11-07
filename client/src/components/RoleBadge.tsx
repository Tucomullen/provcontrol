import { Badge } from "@/components/ui/badge";
import { Shield, User, Briefcase } from "lucide-react";

interface RoleBadgeProps {
  role: "presidente" | "propietario" | "proveedor";
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const roleConfig = {
    presidente: {
      label: "Presidente",
      icon: Shield,
      variant: "default" as const,
    },
    propietario: {
      label: "Propietario",
      icon: User,
      variant: "secondary" as const,
    },
    proveedor: {
      label: "Proveedor",
      icon: Briefcase,
      variant: "outline" as const,
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className} data-testid={`badge-role-${role}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}