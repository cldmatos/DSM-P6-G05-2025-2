"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import Rating from "@/components/molecules/Rating";
import CardsGallery from "@/components/organisms/CardsGallery";
import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header";
import {
  getGameById,
  getSimilarGames,
  rateGame,
} from "@/lib/api";
import {
  BackendGame,
  GameCardData,
  formatPrice,
  formatReleaseDate,
  getRatingPercent,
  mapApiResponseToCardGames,
  resolveGameImage,
  splitCommaSeparated,
} from "@/lib/gameMappers";
import {
  CalendarIcon,
  UserGroupIcon,
  TagIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const [userVote, setUserVote] = useState(0);
  const [game, setGame] = useState<BackendGame | null>(null);
  const [similarGames, setSimilarGames] = useState<GameCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [voteFeedback, setVoteFeedback] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  const gameId = useMemo(() => {
    const paramValue = params?.id;
    if (typeof paramValue === "string") {
      const parsed = Number(paramValue);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (Array.isArray(paramValue) && paramValue.length > 0) {
      const parsed = Number(paramValue[0]);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }, [params]);

  useEffect(() => {
    if (gameId == null) {
      setErrorMessage("Jogo não encontrado.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const validGameId = gameId;

    async function loadGameDetails() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const gameResponse = await getGameById(validGameId);
        if (cancelled) return;

        if (gameResponse.sucesso === false || !gameResponse.dados) {
          throw new Error(
            gameResponse.erro ||
            gameResponse.mensagem ||
            "Não foi possível carregar este jogo."
          );
        }

        const fetchedGame = gameResponse.dados as BackendGame;
        setGame(fetchedGame);

        const similarResponse = await getSimilarGames(validGameId, 6);
        if (cancelled) return;

        if (similarResponse.sucesso !== false) {
          setSimilarGames(mapApiResponseToCardGames(similarResponse));
        } else {
          setSimilarGames([]);
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes do jogo:", error);
        if (!cancelled) {
          setErrorMessage("Não foi possível carregar os detalhes deste jogo.");
          setGame(null);
          setSimilarGames([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadGameDetails();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  const ratingPercent = getRatingPercent(game);
  const releaseDateLabel = formatReleaseDate(game?.release_date) || "Data não disponível";
  const genres = useMemo(() => splitCommaSeparated(game?.genres), [game?.genres]);
  const categories = useMemo(
    () => splitCommaSeparated(game?.categories),
    [game?.categories]
  );
  const priceLabel = formatPrice(game?.price);
  const coverImage = resolveGameImage(game);
  const positiveCountLabel = Number(game?.positive ?? 0).toLocaleString("pt-BR");
  const negativeCountLabel = Number(game?.negative ?? 0).toLocaleString("pt-BR");

  const handleVote = (vote: number) => {
    setUserVote(vote);
    setVoteFeedback(null);
    setVoteError(null);
  };

  const handleSaveVote = async () => {
    if (gameId == null || userVote === 0) {
      return;
    }

    try {
      setIsSubmittingVote(true);
      setVoteFeedback(null);
      setVoteError(null);

      const response = await rateGame(gameId, userVote === 1);

      if (response.sucesso === false) {
        throw new Error(
          response.erro ||
          response.mensagem ||
          "Não foi possível registrar a avaliação."
        );
      }

      const mensagem =
        response.mensagem ||
        (userVote === 1
          ? "Avaliação positiva registrada com sucesso."
          : "Avaliação negativa registrada com sucesso.");

      setVoteFeedback(mensagem);
    } catch (error) {
      console.error("Erro ao salvar voto:", error);
      setVoteError(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a avaliação."
      );
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleGameClick = (gameIdToOpen: number) => {
    router.push(`/jogo/${gameIdToOpen}`);
  };

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen">
        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh] text-muted">
            Carregando jogo...
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center space-y-6">
            <p className="text-foreground/80 text-lg max-w-xl">{errorMessage}</p>
            <Button
              onClick={() => router.push("/jogos")}
              className="border border-primary/50 hover:bg-primary hover:text-background font-medium py-2 px-4 rounded-full transition-all duration-300"
            >
              Voltar para a lista de jogos
            </Button>
          </div>
        ) : game ? (
          <>
            <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
              {coverImage && (
                <Image
                  src={coverImage}
                  alt={game.name || "Capa do jogo"}
                  fill
                  priority
                  quality={90}
                  className="object-cover"
                  sizes="100vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
                <div className="flex flex-row items-center justify-between">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    {game.name || `Jogo #${game.id}`}
                  </h1>
                  <Button
                    onClick={() => router.back()}
                    className="!w-26 mb-4 border border-primary/50 hover:bg-primary hover:text-background font-medium py-2 px-4 rounded-full transition-all duration-300 flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Voltar
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Rating rating={ratingPercent} size="lg" />
                  <span className="text-muted">|</span>
                  <div className="flex items-center gap-2 text-muted">
                    <CalendarIcon className="w-5 h-5" />
                    <span>{releaseDateLabel}</span>
                  </div>
                  {priceLabel && (
                    <span className="text-muted">| {priceLabel}</span>
                  )}
                </div>
              </div>
            </section>

            <section className="px-4 py-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
              <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">
                        Sobre o Jogo
                      </h2>
                      <p className="text-foreground/90 leading-relaxed text-lg">
                        {game.description || "Descrição não disponível."}
                      </p>
                    </div>

                    <div className="bg-background/50 border border-primary/20 rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4">Avaliar este Jogo</h3>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <Rating
                            rating={0}
                            size="lg"
                            interactive
                            onRate={handleVote}
                            userVote={userVote}
                          />
                        </div>
                        {userVote !== 0 && (
                          <Button
                            onClick={handleSaveVote}
                            disabled={isSubmittingVote}
                            className="bg-gradient-to-r from-primary to-secondary text-background font-bold py-2 px-6 rounded-full hover:shadow-[0_0_20px_rgba(5,219,242,0.5)] transition-all duration-300 disabled:opacity-50"
                          >
                            {isSubmittingVote ? "Enviando..." : "Salvar Voto"}
                          </Button>
                        )}
                        {voteFeedback && (
                          <p className="text-sm text-green-400">
                            {voteFeedback}
                          </p>
                        )}
                        {voteError && (
                          <p className="text-sm text-red-400">
                            {voteError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-background/50 border border-secondary/20 rounded-2xl p-6 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <UserGroupIcon className="w-5 h-5 text-secondary" />
                          <h3 className="font-bold text-secondary">Avaliações</h3>
                        </div>
                        <p className="text-foreground/80">Positivas: {positiveCountLabel}</p>
                        <p className="text-foreground/80">Negativas: {negativeCountLabel}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TagIcon className="w-5 h-5 text-secondary" />
                          <h3 className="font-bold text-secondary">Gêneros</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {genres.length > 0 ? (
                            genres.map((genre) => (
                              <span
                                key={genre}
                                className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm"
                              >
                                {genre}
                              </span>
                            ))
                          ) : (
                            <span className="text-foreground/70 text-sm">
                              Não informado
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TagIcon className="w-5 h-5 text-secondary" />
                          <h3 className="font-bold text-secondary">Categorias</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {categories.length > 0 ? (
                            categories.map((category) => (
                              <span
                                key={category}
                                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                              >
                                {category}
                              </span>
                            ))
                          ) : (
                            <span className="text-foreground/70 text-sm">
                              Não informado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {similarGames.length > 0 && (
              <section className="px-4 pb-16">
                <div className="max-w-7xl mx-auto space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary">
                    Jogos semelhantes
                  </h2>
                  <CardsGallery
                    games={similarGames}
                    onGameClick={handleGameClick}
                  />
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>
      <Footer />
    </>
  );
}
