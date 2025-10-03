"use client";

import { useState } from "react";
import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header";
import CardsGallery from "@/components/organisms/CardsGallery";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function GamesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const allGames = [
    { id: 1, title: "The Witcher 3: Wild Hunt", image: "/games/witcher3.png", rating: 4.8 },
    { id: 2, title: "Elden Ring", image: "/games/eldenring.png", rating: 4.7 },
    { id: 3, title: "Red Dead Redemption 2", image: "/games/rdr2.png", rating: 4.9 },
    { id: 4, title: "Cyberpunk 2077", image: "/games/cyberpunk.png", rating: 4.3 },
    { id: 5, title: "Baldur's Gate 3", image: "/games/baldurs.png", rating: 4.9 },
    { id: 6, title: "God of War Ragnarök", image: "/games/gow.png", rating: 4.8 },
    { id: 7, title: "Hogwarts Legacy", image: "/games/hogwarts.png", rating: 4.5 },
    { id: 8, title: "Starfield", image: "/games/starfield.png", rating: 4.2 },
    { id: 9, title: "The Last of Us Part II", image: "/games/tlou2.png", rating: 4.6 },
    { id: 10, title: "Spider-Man 2", image: "/games/spiderman.png", rating: 4.8 },
  ];

  const filteredGames = allGames.filter((game) =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGameClick = (gameId: number) => {
    router.push(`/jogo/${gameId}`);
  };

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen">
        <section className="relative px-4 py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-center bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient leading-tight py-2">
              Explore Todos os Jogos
            </h1>
            <div className="max-w-2xl mx-auto relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-primary pointer-events-none z-10" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background/80 backdrop-blur-sm border-2 border-primary/30 rounded-full py-3 md:py-4 pl-12 md:pl-14 pr-6 text-foreground placeholder-muted focus:outline-none focus:border-primary focus:shadow-[0_0_20px_rgba(5,219,242,0.3)] transition-all duration-300"
              />
            </div>
            <p className="text-center text-muted mt-4">
              {filteredGames.length} {filteredGames.length === 1 ? "jogo encontrado" : "jogos encontrados"}
            </p>
          </div>
        </section>

        <section className="px-4 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            {filteredGames.length > 0 ? (
              <CardsGallery games={filteredGames} onGameClick={handleGameClick} />
            ) : (
              <div className="text-center py-20">
                <p className="text-2xl text-muted">Nenhum jogo encontrado</p>
                <p className="text-muted mt-2">Tente buscar por outro termo</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
