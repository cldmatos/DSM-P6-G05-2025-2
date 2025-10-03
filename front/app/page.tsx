"use client";

import Button from "@/components/atoms/Button";
import GameCard from "@/components/molecules/Cards";
import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header";
import { SparklesIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const recommendedGames = [
    {
      id: 1,
      title: "The Witcher 3: Wild Hunt",
      image: "/games/witcher3.png",
      rating: 4.8,
    },
    {
      id: 2,
      title: "Elden Ring",
      image: "/games/eldenring.png",
      rating: 4.7,
    },
    {
      id: 3,
      title: "Red Dead Redemption 2",
      image: "/games/rdr2.png",
      rating: 4.9,
    },
    {
      id: 4,
      title: "Cyberpunk 2077",
      image: "/games/cyberpunk.png",
      rating: 4.3,
    },
  ];

  const popularGames = [
    {
      id: 5,
      title: "Baldur's Gate 3",
      image: "/games/baldurs.png",
      rating: 4.9,
    },
    {
      id: 6,
      title: "God of War Ragnarök",
      image: "/games/gow.png",
      rating: 4.8,
    },
    {
      id: 7,
      title: "Hogwarts Legacy",
      image: "/games/hogwarts.png",
      rating: 4.5,
    },
    {
      id: 8,
      title: "Starfield",
      image: "/games/starfield.png",
      rating: 4.2,
    },
  ];

  const handleGameClick = (gameId: number) => {
    router.push(`/jogo/${gameId}`);
  };

  const handleExploreMore = () => {
    router.push("/jogos");
  };

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen">
        <section className="relative px-4 py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
              Bem-vindo ao Game List
            </h1>
            <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto mb-8">
              Descubra jogos incríveis personalizados para você através de
              recomendações inteligentes baseadas em IA.
            </p>
            <Button
              onClick={handleExploreMore}
              className="bg-gradient-to-r from-primary to-secondary text-background font-bold py-4 rounded-full text-lg hover:shadow-[0_0_30px_rgba(5,219,242,0.5)] transition-all duration-300 hover:scale-105"
            >
              Explorar Jogos
            </Button>
          </div>
        </section>

        <section className="px-4 py-16 md:py-15 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <SparklesIcon className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Recomendações para Você
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {recommendedGames.map((game) => (
                <GameCard
                  key={game.id}
                  title={game.title}
                  image={game.image}
                  rating={game.rating}
                  onClick={() => handleGameClick(game.id)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:py-15">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4 ">
              <ArrowTrendingUpIcon className="w-8 h-8 text-secondary" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Populares na Comunidade
              </h2>
              <Button
                onClick={handleExploreMore}
                className="!w-auto border border-secondary text-secondary hover:bg-secondary hover:text-background font-medium py-1 px-3 rounded-full transition-all duration-300 text-xs ml-auto"
              >
                Ver todos
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {popularGames.map((game) => (
                <GameCard
                  key={game.id}
                  title={game.title}
                  image={game.image}
                  rating={game.rating}
                  onClick={() => handleGameClick(game.id)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
