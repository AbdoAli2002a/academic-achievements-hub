import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  className?: string;
}

const SIZE_MAP = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" };

export const StarRating = ({
  value,
  onChange,
  size = "md",
  readOnly = false,
  className,
}: StarRatingProps) => {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(display);
        const half = !filled && i - 0.5 <= display;
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(i)}
            onMouseLeave={() => !readOnly && setHover(null)}
            onClick={() => !readOnly && onChange?.(i)}
            className={cn(
              "transition-transform",
              !readOnly && "hover:scale-110 cursor-pointer",
              readOnly && "cursor-default"
            )}
            aria-label={`${i} stars`}
          >
            <Star
              className={cn(
                SIZE_MAP[size],
                filled || half ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
