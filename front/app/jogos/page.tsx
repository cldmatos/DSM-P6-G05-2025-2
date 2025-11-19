"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header";
import CardsGallery from "@/components/organisms/CardsGallery";
import {
  getBestRatedGames,
  getPopularGames,
  getUserRecommendations,
  searchGames,
} from "@/lib/api";
import {
  GameCardData,
  mapApiResponseToCardGames,
} from "@/lib/gameMappers";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { getStoredUserId } from "@/lib/userStorage";

export default function GamesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState<GameCardData[]>([]);
  const [displayedGames, setDisplayedGames] = useState<GameCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        setCurrentSource("");

        // Busca recomendações personalizadas e cai para rankings se necessário.
        const storedUserId = getStoredUserId();
        let fetchedGames: GameCardData[] = [];

        if (storedUserId) {
          const personalizedResponse = await getUserRecommendations(
            storedUserId,
            60
          );
          if (cancelled) return;

          if (personalizedResponse.sucesso !== false) {
            const personalizedGames = mapApiResponseToCardGames(
              personalizedResponse
            );

            if (personalizedGames.length > 0) {
              fetchedGames = personalizedGames;
              setCurrentSource("Recomendações personalizadas");
            }
          }
        }

        if (!cancelled && fetchedGames.length === 0) {
          const bestRatedResponse = await getBestRatedGames(60, 20);
          if (cancelled) return;

          if (bestRatedResponse.sucesso !== false) {
            const bestRatedGames = mapApiResponseToCardGames(bestRatedResponse);
            if (bestRatedGames.length > 0) {
              fetchedGames = bestRatedGames;
              setCurrentSource("Jogos mais bem avaliados");
            }
          }
        }

        if (!cancelled && fetchedGames.length === 0) {
          const popularResponse = await getPopularGames(60);
          if (cancelled) return;

          if (popularResponse.sucesso !== false) {
            const popularGames = mapApiResponseToCardGames(popularResponse);
            if (popularGames.length > 0) {
              fetchedGames = popularGames;
              setCurrentSource("Jogos populares");
            }
          }
        }

        if (fetchedGames.length === 0) {
          throw new Error("Não foi possível obter jogos recomendados.");
        }

        setGames(fetchedGames);
        setDisplayedGames(fetchedGames);
      } catch (error) {
        console.error("Erro ao listar jogos:", error);
        if (!cancelled) {
          setErrorMessage("Não foi possível carregar os jogos recomendados.");
          setGames([]);
          setDisplayedGames([]);
          setCurrentSource("");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setDisplayedGames(games);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const term = searchTerm.trim();
    setIsSearching(true);
    setSearchError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await searchGames(term);
        if (cancelled) return;

        if (response.sucesso === false) {
          setSearchError(
            response.erro || response.mensagem || "Erro ao buscar jogos."
          );
          setDisplayedGames([]);
          return;
        }

        const results = mapApiResponseToCardGames(response);
        setDisplayedGames(results);
        if (results.length === 0) {
          setSearchError("Nenhum jogo encontrado para este termo.");
        }
      } catch (error) {
        console.error("Erro na busca de jogos:", error);
        if (!cancelled) {
          setSearchError("Erro ao buscar jogos. Tente novamente mais tarde.");
          setDisplayedGames([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm, games]);

  const handleGameClick = (gameId: number) => {
    router.push(`/jogo/${gameId}`);
  };

  const totalLabel = searchTerm.trim()
    ? `${displayedGames.length} ${displayedGames.length === 1 ? "jogo encontrado" : "jogos encontrados"
    }`
    : `${displayedGames.length} ${displayedGames.length === 1
      ? "jogo recomendado"
      : "jogos recomendados"
    }`;
  const showSourceMessage = !searchTerm.trim() && currentSource;

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
              {isSearching
                ? "Buscando jogos..."
                : totalLabel}
            </p>
            {showSourceMessage && (
              <p className="text-center text-muted/80 mt-1 text-sm">
                {currentSource}
              </p>
            )}
            {searchError && (
              <p className="text-center text-red-400 mt-2 text-sm">{searchError}</p>
            )}
          </div>
        </section>

        <section className="px-4 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            {errorMessage ? (
              <div className="text-center py-20">
                <p className="text-2xl text-red-400">{errorMessage}</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-20">
                <p className="text-2xl text-muted">Carregando jogos...</p>
              </div>
            ) : displayedGames.length > 0 ? (
              <CardsGallery games={displayedGames} onGameClick={handleGameClick} />
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
