import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = true,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  const sizeClass = sizes[size];

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const filled = index < Math.floor(rating);
          const partial = index < rating && index >= Math.floor(rating);

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              disabled={!interactive}
              className={`${interactive ? "cursor-pointer hover-elevate" : "cursor-default"}`}
              data-testid={`star-${index + 1}`}
            >
              <Star
                className={`${sizeClass} ${
                  filled
                    ? "fill-chart-4 text-chart-4"
                    : partial
                    ? "fill-chart-4/50 text-chart-4"
                    : "fill-muted text-muted"
                }`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-foreground ml-1" data-testid="rating-number">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}