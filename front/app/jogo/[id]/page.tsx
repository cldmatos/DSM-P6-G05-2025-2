"use client";

import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header";
import Rating from "@/components/molecules/Rating";
import Button from "@/components/atoms/Button";
import Image from "next/image";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarIcon,
  UserGroupIcon,
  TagIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const [userRating, setUserRating] = useState(0);

  const game = {
    id: params.id,
    title: "The Witcher 3: Wild Hunt",
    image: "/games/witcher3.png",
    coverImage: "/games/witcher3-cover.png",
    rating: 4.8,
    description:
      "The Witcher 3: Wild Hunt é um RPG de ação em mundo aberto que segue a história de Geralt de Rívia, um caçador de monstros profissional em busca de sua filha adotiva em fuga, enquanto o exército do Império Nilfgaardiano invade os Reinos do Norte. Com um vasto mundo repleto de cidades mercantes, ilhas vikings, passagens perigosas em montanhas e cavernas esquecidas para explorar, este jogo oferece uma experiência imersiva incomparável.",
    releaseDate: "19 de Maio, 2015",
    developer: "CD Projekt Red",
    genres: ["RPG", "Ação", "Aventura", "Mundo Aberto"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    console.log("Nova avaliação:", rating);
  };

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen">
        <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <Image
            src={game.image}
            alt={game.title}
            fill
            priority
            quality={100}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <div className="flex flex-row items-center justify-between">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                {game.title}
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
              <Rating rating={game.rating} size="lg" />
              <span className="text-muted">|</span>
              <div className="flex items-center gap-2 text-muted">
                <CalendarIcon className="w-5 h-5" />
                <span>{game.releaseDate}</span>
              </div>
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
                    {game.description}
                  </p>
                </div>

                <div className="bg-background/50 border border-primary/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4">Avaliar este Jogo</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Rating
                      rating={userRating}
                      size="lg"
                      interactive
                      onRate={handleRating}
                    />
                    {userRating > 0 && (
                      <Button
                        onClick={() => console.log("Salvando avaliação")}
                        className="bg-gradient-to-r from-primary to-secondary text-background font-bold py-2 px-6 rounded-full hover:shadow-[0_0_20px_rgba(5,219,242,0.5)] transition-all duration-300"
                      >
                        Salvar Avaliação
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-background/50 border border-secondary/20 rounded-2xl p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserGroupIcon className="w-5 h-5 text-secondary" />
                      <h3 className="font-bold text-secondary">
                        Desenvolvedor
                      </h3>
                    </div>
                    <p className="text-foreground/80">{game.developer}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TagIcon className="w-5 h-5 text-secondary" />
                      <h3 className="font-bold text-secondary">Gêneros</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {game.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-secondary mb-2">
                      Plataformas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {game.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
