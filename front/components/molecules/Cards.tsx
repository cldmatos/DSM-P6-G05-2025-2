import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";

interface GameCardProps {
  title: string;
  image: string;
  rating: number;
  onClick?: () => void;
}

export default function GameCard({ title, image, rating, onClick }: GameCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-gradient-to-br from-background to-primary/10 rounded-xl overflow-hidden border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(5,219,242,0.3)] hover:-translate-y-2 cursor-pointer"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 min-h-[3.5rem]">
          {title}
        </h3>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <StarIcon
                key={index}
                className={`w-4 h-4 ${index < Math.floor(rating)
                  ? "fill-primary text-primary"
                  : "text-muted"
                  }`}
              />
            ))}
          </div>
          <span className="text-primary font-semibold text-sm">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
