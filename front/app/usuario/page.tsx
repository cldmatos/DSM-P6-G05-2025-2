"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  EnvelopeIcon,
  CalendarIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header";
import Rating from "@/components/molecules/Rating";
import { getUserById } from "@/lib/api";
import Button from "@/components/atoms/Button";

type RatedGame = {
  jogoId: number;
  titulo: string;
  imagem: string | null;
  nota: number;
  avaliadoEm: string;
};

type UserProfile = {
  id: number;
  nome: string;
  email: string;
  categorias: string[];
  criadoEm: string;
  avaliacoes: RatedGame[];
  estatisticas: {
    totalAvaliacoes: number;
    notaMedia: number | null;
  };
};

const FALLBACK_AVATAR = "/Icon.svg";
const FALLBACK_GAME_IMAGE = "/games/witcher3.png";

export default function UserPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState(FALLBACK_AVATAR);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileFromStorage() {
      try {
        const storedUserRaw = window.localStorage.getItem("authUserProfile");
        if (!storedUserRaw) {
          setErrorMessage("Nenhum usuário autenticado encontrado.");
          setIsLoading(false);
          return;
        }

        const storedUser = JSON.parse(storedUserRaw) as { id?: number };
        if (!storedUser?.id) {
          setErrorMessage("Dados de usuário inválidos. Faça login novamente.");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        const response = await getUserById(storedUser.id);
        if (cancelled) return;

        if (response.sucesso !== false && response.dados) {
          setUserProfile(response.dados as UserProfile);
          window.localStorage.setItem(
            "authUserProfile",
            JSON.stringify(response.dados)
          );
        } else {
          setErrorMessage(
            response.erro || response.mensagem || "Não foi possível carregar o perfil."
          );
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setErrorMessage("Ocorreu um erro ao carregar o perfil. Faça login novamente.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfileFromStorage();

    return () => {
      cancelled = true;
    };
  }, []);

  const ratedGames = useMemo(() => userProfile?.avaliacoes ?? [], [userProfile]);

  const averageRating = useMemo(() => {
    const media = userProfile?.estatisticas?.notaMedia;
    if (typeof media === "number" && !Number.isNaN(media)) {
      return media.toFixed(1);
    }
    if (!ratedGames.length) return "-";
    const total = ratedGames.reduce((acc, game) => acc + (game.nota ?? 0), 0);
    return (total / ratedGames.length).toFixed(1);
  }, [ratedGames, userProfile?.estatisticas?.notaMedia]);

  const handleGameClick = (gameId: number) => {
    if (!gameId) return;
    router.push(`/jogo/${gameId}`);
  };

  const formatDate = (isoDate: string) => {
    if (!isoDate) return "Data indisponível";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(isoDate));
    } catch {
      return "Data inválida";
    }
  };

  const avatarUrl = useMemo(() => {
    if (!userProfile?.email) return FALLBACK_AVATAR;
    const email = userProfile.email.trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = (hash << 5) - hash + email.charCodeAt(i);
      hash |= 0;
    }
    const fallbacks = ["/Icon.svg", "/games/witcher3.png", "/games/rdr2.png"];
    return fallbacks[Math.abs(hash) % fallbacks.length];
  }, [userProfile?.email]);

  useEffect(() => {
    setAvatarSrc(avatarUrl);
  }, [avatarUrl]);

  const resolveGameImage = (game: RatedGame) => {
    if (game.imagem) {
      if (game.imagem.startsWith("http")) return game.imagem;
      if (game.imagem.startsWith("/")) return game.imagem;
      return `/${game.imagem.replace(/^\/+/g, "")}`;
    }
    return FALLBACK_GAME_IMAGE;
  };

  const handleGoToLogin = () => {
    window.localStorage.removeItem("authUserProfile");
    router.push("/login");
  };

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen">
        <section className="relative px-4 py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="bg-background/50 border border-primary/20 rounded-3xl p-8 md:p-12">
              {isLoading && (
                <div className="text-center py-12">
                  <p className="text-muted">Carregando perfil...</p>
                </div>
              )}

              {!isLoading && errorMessage && (
                <div className="text-center py-12 space-y-4">
                  <p className="text-red-400">{errorMessage}</p>
                  <Button
                    onClick={handleGoToLogin}
                    className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-background hover:bg-primary/80 transition"
                  >
                    Ir para o login
                  </Button>
                </div>
              )}

              {!isLoading && !errorMessage && userProfile && (
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                      <div className="w-full h-full rounded-full bg-background overflow-hidden relative">
                        <Image
                          src={avatarSrc}
                          alt={`Avatar de ${userProfile.nome}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 128px, 160px"
                          onError={() => {
                            setAvatarSrc(FALLBACK_AVATAR);
                          }}
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-background rounded-full p-2">
                      <TrophyIcon className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                      {userProfile.nome}
                    </h1>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center md:justify-start gap-2 text-foreground/80">
                        <EnvelopeIcon className="w-5 h-5 text-secondary" />
                        <span>{userProfile.email}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="bg-primary/10 border border-primary/30 rounded-xl px-6 py-3">
                        <p className="text-3xl font-bold text-primary">
                          {userProfile.estatisticas.totalAvaliacoes}
                        </p>
                        <p className="text-sm text-muted">Jogos Avaliados</p>
                      </div>
                      <div className="bg-secondary/10 border border-secondary/30 rounded-xl px-6 py-3">
                        <p className="text-3xl font-bold text-secondary">
                          {averageRating}
                        </p>
                        <p className="text-sm text-muted">Nota Média</p>
                      </div>
                    </div>

                    {userProfile.categorias?.length ? (
                      <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
                        {userProfile.categorias.map((categoria) => (
                          <span
                            key={categoria}
                            className="px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs uppercase tracking-wide text-primary"
                          >
                            {categoria}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {!isLoading && !errorMessage && userProfile && (
          <section className="px-4 py-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
                <TrophyIcon className="w-8 h-8 text-primary" />
                Jogos Avaliados
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ratedGames.map((game) => (
                  <div
                    key={game.jogoId}
                    onClick={() => handleGameClick(game.jogoId)}
                    className="bg-background/50 border border-primary/20 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_30px_rgba(5,219,242,0.2)] hover:scale-105"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                        style={{
                          backgroundImage: `url(${resolveGameImage(game)})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                        {game.titulo}
                      </h3>

                      <div className="flex items-center justify-between">
                        <Rating rating={game.nota ?? 0} size="sm" />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Avaliado em {formatDate(game.avaliadoEm)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {ratedGames.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted text-lg">
                    Nenhum jogo avaliado ainda.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
