"use client";

import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import {
  HandThumbUpIcon as HandThumbUpOutlineIcon,
  HandThumbDownIcon as HandThumbDownOutlineIcon,
} from "@heroicons/react/24/outline";

interface RatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  userVote?: number;
}

export default function Rating({
  rating,
  size = "md",
  interactive = false,
  onRate,
  userVote = 0,
}: RatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const handleVote = (vote: number) => {
    if (interactive && onRate) {
      onRate(userVote === vote ? 0 : vote);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote(1)}
        disabled={!interactive}
        className={`${interactive
          ? "cursor-pointer hover:scale-110 transition-transform"
          : "cursor-default"
          }`}
      >
        {userVote === 1 ? (
          <HandThumbUpIcon className={`${sizeClasses[size]} text-green-500`} />
        ) : (
          <HandThumbUpOutlineIcon
            className={`${sizeClasses[size]
              } ${interactive ? "text-muted hover:text-green-400" : "text-muted"}`}
          />
        )}
      </button>

      <button
        onClick={() => handleVote(-1)}
        disabled={!interactive}
        className={`${interactive
          ? "cursor-pointer hover:scale-110 transition-transform"
          : "cursor-default"
          }`}
      >
        {userVote === -1 ? (
          <HandThumbDownIcon className={`${sizeClasses[size]} text-red-500`} />
        ) : (
          <HandThumbDownOutlineIcon
            className={`${sizeClasses[size]
              } ${interactive ? "text-muted hover:text-red-400" : "text-muted"}`}
          />
        )}
      </button>

      {!interactive && (
        <span className="ml-1 text-muted font-medium">
          {rating.toFixed(0)}% positivo
        </span>
      )}
    </div>
  );
}
