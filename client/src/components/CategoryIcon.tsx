import { 
  Wrench, 
  Zap, 
  Hammer, 
  TreePine, 
  Paintbrush, 
  Drill, 
  Sparkles, 
  Key, 
  Wind, 
  MoreHorizontal 
} from "lucide-react";

type Category = 
  | "fontaneria" 
  | "electricidad" 
  | "albanileria" 
  | "jardineria" 
  | "pintura" 
  | "carpinteria" 
  | "limpieza" 
  | "cerrajeria" 
  | "climatizacion" 
  | "otros";

interface CategoryIconProps {
  category: Category;
  className?: string;
}

export function CategoryIcon({ category, className = "w-4 h-4" }: CategoryIconProps) {
  const icons = {
    fontaneria: Wrench,
    electricidad: Zap,
    albanileria: Hammer,
    jardineria: TreePine,
    pintura: Paintbrush,
    carpinteria: Drill,
    limpieza: Sparkles,
    cerrajeria: Key,
    climatizacion: Wind,
    otros: MoreHorizontal,
  };

  const Icon = icons[category];
  return <Icon className={className} />;
}

export function getCategoryLabel(category: Category): string {
  const labels = {
    fontaneria: "Fontanería",
    electricidad: "Electricidad",
    albanileria: "Albañilería",
    jardineria: "Jardinería",
    pintura: "Pintura",
    carpinteria: "Carpintería",
    limpieza: "Limpieza",
    cerrajeria: "Cerrajería",
    climatizacion: "Climatización",
    otros: "Otros",
  };

  return labels[category];
}