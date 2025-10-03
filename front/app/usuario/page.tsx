"use client";

import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header";
import Rating from "@/components/molecules/Rating";
import { useParams, useRouter } from "next/navigation";
import {
  UserCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

export default function UserPage() {
  const params = useParams();
  const router = useRouter();

  const user = {
    id: params.id,
    name: "João Silva",
    email: "joao.silva@email.com",
    avatar: "/avatar-placeholder.png",
    totalReviews: 12,
  };

  const ratedGames = [
    {
      id: 1,
      title: "The Witcher 3: Wild Hunt",
      image: "/games/witcher3.png",
      userRating: 5,
      ratedAt: "15 Mar 2024",
    },
    {
      id: 2,
      title: "Elden Ring",
      image: "/games/eldenring.png",
      userRating: 4.5,
      ratedAt: "12 Mar 2024",
    },
    {
      id: 3,
      title: "Red Dead Redemption 2",
      image: "/games/rdr2.png",
      userRating: 5,
      ratedAt: "08 Mar 2024",
    },
    {
      id: 4,
      title: "Cyberpunk 2077",
      image: "/games/cyberpunk.png",
      userRating: 4,
      ratedAt: "05 Mar 2024",
    },
    {
      id: 5,
      title: "Baldur's Gate 3",
      image: "/games/baldurs.png",
      userRating: 5,
      ratedAt: "01 Mar 2024",
    },
    {
      id: 6,
      title: "God of War Ragnarök",
      image: "/games/gow.png",
      userRating: 4.5,
      ratedAt: "28 Fev 2024",
    },
  ];

  const handleGameClick = (gameId: number) => {
    router.push(`/jogo/${gameId}`);
  };

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen">
        <section className="relative px-4 py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="bg-background/50 border border-primary/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <UserCircleIcon className="w-24 h-24 md:w-32 md:h-32 text-primary" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-background rounded-full p-2">
                    <TrophyIcon className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    {user.name}
                  </h1>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-foreground/80">
                      <EnvelopeIcon className="w-5 h-5 text-secondary" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="bg-primary/10 border border-primary/30 rounded-xl px-6 py-3">
                      <p className="text-3xl font-bold text-primary">
                        {user.totalReviews}
                      </p>
                      <p className="text-sm text-muted">Jogos Avaliados</p>
                    </div>
                    <div className="bg-secondary/10 border border-secondary/30 rounded-xl px-6 py-3">
                      <p className="text-3xl font-bold text-secondary">
                        {(
                          ratedGames.reduce(
                            (acc, game) => acc + game.userRating,
                            0
                          ) / ratedGames.length
                        ).toFixed(1)}
                      </p>
                      <p className="text-sm text-muted">Nota Média</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
              <TrophyIcon className="w-8 h-8 text-primary" />
              Jogos Avaliados
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ratedGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleGameClick(game.id)}
                  className="bg-background/50 border border-primary/20 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_30px_rgba(5,219,242,0.2)] hover:scale-105"
                >
                  <div className="relative h-48 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                      style={{
                        backgroundImage: `url(${game.image})`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {game.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <Rating rating={game.userRating} size="sm" />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Avaliado em {game.ratedAt}</span>
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
      </div>
      <Footer />
    </>
  );
}
