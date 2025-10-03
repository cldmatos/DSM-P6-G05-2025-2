"use client";

import { useState } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import CheckBox from "@/components/atoms/CheckBox";
import Image from "next/image";

export default function SignUpPage() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const handleGenreChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedGenres([...selectedGenres, value]);
    } else {
      setSelectedGenres(selectedGenres.filter((genre) => genre !== value));
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#eeeedd] relative">
      <div className="absolute top-2 right-4">
        <Image
          src={"/Icon.svg"}
          width={48}
          height={48}
          alt={"Logo do App"}
          quality={100}
        />
      </div>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-8">
        <div className="space-y-5">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-[#05DBF2]">
              Crie sua conta
            </h1>
          </div>

          <form className="space-y-4 rounded-md bg-[#0788D9]/10 p-6 shadow-lg">
            <Input
              id="name"
              type="text"
              required
              label="Nome"
              placeholder="Seu Nome Completo"
              autoComplete="name"
            />
            <Input
              id="email"
              type="email"
              required
              label="E-mail"
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
            />
            <Input
              id="password"
              type="password"
              required
              label="Senha"
              placeholder="SuaSenhaSecreta123"
              autoComplete="new-password"
            />
            <Input
              id="confirmPassword"
              type="password"
              required
              label="Confirmar Senha"
              placeholder="SuaSenhaSecreta123"
              autoComplete="new-password"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#eeeedd]">
                Gêneros de Jogos Favoritos
              </label>
              <div className="grid grid-cols-2 gap-3">
                <CheckBox
                  id="genre-acao"
                  label="Ação"
                  value="acao"
                  checked={selectedGenres.includes("acao")}
                  onChange={(checked) => handleGenreChange("acao", checked)}
                />
                <CheckBox
                  id="genre-aventura"
                  label="Aventura"
                  value="aventura"
                  checked={selectedGenres.includes("aventura")}
                  onChange={(checked) => handleGenreChange("aventura", checked)}
                />
                <CheckBox
                  id="genre-rpg"
                  label="RPG"
                  value="rpg"
                  checked={selectedGenres.includes("rpg")}
                  onChange={(checked) => handleGenreChange("rpg", checked)}
                />
                <CheckBox
                  id="genre-estrategia"
                  label="Estratégia"
                  value="estrategia"
                  checked={selectedGenres.includes("estrategia")}
                  onChange={(checked) => handleGenreChange("estrategia", checked)}
                />
                <CheckBox
                  id="genre-esportes"
                  label="Esportes"
                  value="esportes"
                  checked={selectedGenres.includes("esportes")}
                  onChange={(checked) => handleGenreChange("esportes", checked)}
                />
                <CheckBox
                  id="genre-corrida"
                  label="Corrida"
                  value="corrida"
                  checked={selectedGenres.includes("corrida")}
                  onChange={(checked) => handleGenreChange("corrida", checked)}
                />
                <CheckBox
                  id="genre-fps"
                  label="FPS"
                  value="fps"
                  checked={selectedGenres.includes("fps")}
                  onChange={(checked) => handleGenreChange("fps", checked)}
                />
                <CheckBox
                  id="genre-moba"
                  label="MOBA"
                  value="moba"
                  checked={selectedGenres.includes("moba")}
                  onChange={(checked) => handleGenreChange("moba", checked)}
                />
                <CheckBox
                  id="genre-simulacao"
                  label="Simulação"
                  value="simulacao"
                  checked={selectedGenres.includes("simulacao")}
                  onChange={(checked) => handleGenreChange("simulacao", checked)}
                />
                <CheckBox
                  id="genre-puzzle"
                  label="Puzzle"
                  value="puzzle"
                  checked={selectedGenres.includes("puzzle")}
                  onChange={(checked) => handleGenreChange("puzzle", checked)}
                />
              </div>
            </div>

            <Button type="submit" className="rounded-md p-2">
              Criar Conta
            </Button>
          </form>

          <footer className="text-center text-sm text-[#999999]">
            Já possui conta?{" "}
            <a
              className="font-medium text-[#05DBF2] hover:underline"
              href="/login"
            >
              Faça login aqui
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
