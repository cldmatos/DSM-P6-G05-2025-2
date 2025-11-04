"use client";

import { FormEvent, useEffect, useState } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Image from "next/image";
import CategoriesModal from "@/components/organisms/CategoriesModal";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  const defaultGenres = [
    "acao",
    "aventura",
    "rpg",
    "estrategia",
    "esportes",
    "corrida",
    "fps",
    "moba",
    "simulacao",
    "puzzle",
  ];
  const [availableGenres, setAvailableGenres] = useState<string[]>(defaultGenres);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiUrl.replace(/\/$/, "")}/api/users/categories`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data?.categorias) && data.categorias.length) {
          setAvailableGenres(data.categorias);
        }
      })
      .catch(() => void 0);
    return () => controller.abort();
  }, [apiUrl]);

  const handleGenreChange = (value: string, checked: boolean) => {
    setSelectedGenres((prev) =>
      checked ? [...prev, value] : prev.filter((genre) => genre !== value)
    );
  };

  const handleSelectAllGenres = () => {
    setSelectedGenres(Array.from(new Set(availableGenres)));
  };

  const handleClearGenres = () => {
    setSelectedGenres([]);
  };

  const formatLabel = (value: string) =>
    value
      .replace(/[_-]/g, " ")
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  type ApiResponse = {
    erros?: string[];
    mensagem?: string;
    [key: string]: unknown;
  };

  const parseResponse = async (response: Response): Promise<ApiResponse | null> => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text) as ApiResponse;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      nome: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      senha: String(formData.get("password") ?? ""),
      confirmarSenha: String(formData.get("confirmPassword") ?? ""),
      categorias: selectedGenres,
    };

    if (!payload.categorias.length) {
      setFeedback({ type: "error", text: "Selecione pelo menos um gênero." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`${apiUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await parseResponse(response);
      if (!response.ok) {
        const message =
          Array.isArray(body?.erros) && body.erros.length
            ? body.erros.join(" ")
            : body?.mensagem ?? "Não foi possível criar a conta.";
        setFeedback({ type: "error", text: message });
        return;
      }
      setFeedback({
        type: "success",
        text: body?.mensagem ?? "Conta criada com sucesso.",
      });
      setSelectedGenres([]);
      form.reset();
      router.push("/login");
    } catch {
      setFeedback({ type: "error", text: "Erro de conexão com o servidor." });
    } finally {
      setIsSubmitting(false);
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

          <form
            className="space-y-4 rounded-md bg-[#0788D9]/10 p-6 shadow-lg"
            onSubmit={handleSubmit}
          >
            <Input
              id="name"
              name="name"
              type="text"
              required
              label="Nome"
              placeholder="Seu Nome Completo"
              autoComplete="name"
            />
            <Input
              id="email"
              name="email"
              type="email"
              required
              label="E-mail"
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
            />
            <Input
              id="password"
              name="password"
              type="password"
              required
              label="Senha"
              placeholder="SuaSenhaSecreta123"
              autoComplete="new-password"
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              label="Confirmar Senha"
              placeholder="SuaSenhaSecreta123"
              autoComplete="new-password"
            />
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#eeeedd]">
                Gêneros de Jogos Favoritos
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  className="rounded-md bg-[#05DBF2] px-4 py-2 text-[#1A1A1A] hover:bg-[#05DBF2]/80"
                  onClick={() => setIsModalOpen(true)}
                >
                  Selecionar categorias
                </Button>
                <span className="text-xs text-[#999999]">
                  {selectedGenres.length
                    ? `${selectedGenres.length} selecionado${selectedGenres.length > 1 ? "s" : ""}`
                    : "Nenhum gênero selecionado"}
                </span>
              </div>
            </div>
            {feedback && (
              <p
                className={`text-sm ${feedback.type === "success" ? "text-emerald-400" : "text-red-400"
                  }`}
              >
                {feedback.text}
              </p>
            )}
            <Button type="submit" className="rounded-md p-2" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Criar Conta"}
            </Button>
          </form>

          <CategoriesModal
            open={isModalOpen}
            categories={availableGenres}
            selected={selectedGenres}
            onToggle={handleGenreChange}
            onSelectAll={handleSelectAllGenres}
            onClear={handleClearGenres}
            onClose={() => setIsModalOpen(false)}
            formatLabel={formatLabel}
          />

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
