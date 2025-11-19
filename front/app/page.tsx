"use client";

import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import GameCard from "@/components/molecules/Cards";
import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header";
import {
  getBestRatedGames,
  getPopularGames,
  getUserRecommendations,
} from "@/lib/api";
import {
  GameCardData,
  mapApiResponseToCardGames,
} from "@/lib/gameMappers";
import { SparklesIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { getStoredUserId } from "@/lib/userStorage";

export default function Home() {
  const router = useRouter();
  const [recommendedGames, setRecommendedGames] = useState<GameCardData[]>([]);
  const [popularGames, setPopularGames] = useState<GameCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeGames() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const bestRatedResponse = await getBestRatedGames(8, 20);
        if (cancelled) return;

        if (bestRatedResponse.sucesso === false) {
          throw new Error(
            bestRatedResponse.erro ||
            bestRatedResponse.mensagem ||
            "Erro ao carregar jogos mais bem avaliados."
          );
        }

        const bestRatedGames = mapApiResponseToCardGames(bestRatedResponse);
        setRecommendedGames(bestRatedGames);

        const popularResponse = await getPopularGames(8);
        if (cancelled) return;

        if (popularResponse.sucesso === false) {
          throw new Error(
            popularResponse.erro ||
            popularResponse.mensagem ||
            "Erro ao carregar jogos populares."
          );
        }

        setPopularGames(mapApiResponseToCardGames(popularResponse));

        const storedUserId = getStoredUserId();
        if (storedUserId) {
          const personalizedResponse = await getUserRecommendations(
            storedUserId,
            8
          );
          if (cancelled) return;

          if (personalizedResponse.sucesso !== false) {
            const personalizedGames = mapApiResponseToCardGames(
              personalizedResponse
            );

            if (personalizedGames.length > 0) {
              setRecommendedGames(personalizedGames);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        if (!cancelled) {
          setErrorMessage(
            "Não foi possível carregar os jogos. Tente novamente mais tarde."
          );
          setRecommendedGames([]);
          setPopularGames([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadHomeGames();

    return () => {
      cancelled = true;
    };
  }, []);

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
            {errorMessage && (
              <p className="mt-6 text-red-400 text-sm">{errorMessage}</p>
            )}
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

            {isLoading ? (
              <div className="py-12 text-center text-muted">
                Carregando jogos...
              </div>
            ) : recommendedGames.length > 0 ? (
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
            ) : (
              <div className="py-12 text-center text-muted">
                Nenhum jogo disponível no momento.
              </div>
            )}
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

            {isLoading ? (
              <div className="py-12 text-center text-muted">
                Carregando jogos...
              </div>
            ) : popularGames.length > 0 ? (
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
            ) : (
              <div className="py-12 text-center text-muted">
                Nenhum jogo popular encontrado agora.
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
