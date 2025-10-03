"use client";

import GameCard from "@/components/molecules/Cards";

interface Game {
  id: number;
  title: string;
  image: string;
  rating: number;
}

interface CardsGalleryProps {
  games: Game[];
  onGameClick: (gameId: number) => void;
}

export default function CardsGallery({ games, onGameClick }: CardsGalleryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {games.map((game) => (
        <GameCard
          key={game.id}
          title={game.title}
          image={game.image}
          rating={game.rating}
          onClick={() => onGameClick(game.id)}
        />
      ))}
    </div>
  );
}
