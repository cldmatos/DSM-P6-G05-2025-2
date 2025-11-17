import Image from "next/image";
import { useState } from "react";

interface GameCardProps {
  title: string;
  image: string;
  rating: number;
  onClick?: () => void;
}

export default function GameCard({ title, image, rating, onClick }: GameCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group bg-gradient-to-br from-background to-primary/10 rounded-xl overflow-hidden border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(5,219,242,0.3)] hover:-translate-y-2 cursor-pointer"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
        {!imageError ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30">
            <svg
              className="w-20 h-20 text-primary/60 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
              />
            </svg>
            <span className="text-primary/50 text-sm font-medium">{title}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 min-h-[3.5rem]">
          {title}
        </h3>

        <span className="text-primary font-semibold text-sm">
          {rating.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
