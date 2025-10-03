"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function Rating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRate,
}: RatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const handleClick = (value: number) => {
    if (interactive && onRate) {
      onRate(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            key={index}
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={`${interactive
              ? "cursor-pointer hover:scale-110 transition-transform"
              : "cursor-default"
              }`}
          >
            {isFilled ? (
              <StarIcon
                className={`${sizeClasses[size]} text-primary`}
              />
            ) : (
              <StarOutlineIcon
                className={`${sizeClasses[size]} text-muted`}
              />
            )}
          </button>
        );
      })}
      <span className="ml-2 text-muted font-medium">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
