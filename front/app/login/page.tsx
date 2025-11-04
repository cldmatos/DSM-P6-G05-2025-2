"use client";

import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);
  const router = useRouter();

  type ApiResponse = {
    erros?: string[];
    mensagem?: string;
    [key: string]: unknown;
  };

  const parseResponse = async (response: Response): Promise<ApiResponse | null> => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      email: String(formData.get("email") ?? ""),
      senha: String(formData.get("password") ?? ""),
    };

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(
        `${apiUrl}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const body = await parseResponse(response);
      if (!response.ok) {
        setFeedback({
          type: "error",
          text: body?.mensagem ?? "Credenciais inválidas.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: body?.mensagem ?? "Login realizado com sucesso.",
      });
      form.reset();
      router.push("/");
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
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
        <div className="space-y-5">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-[#05DBF2]">
              Bem-vindo de volta
            </h1>
          </div>

          <form
            className="space-y-4 rounded-md bg-[#0788D9]/10 p-6 shadow-lg"
            onSubmit={handleSubmit}
          >
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
              autoComplete="current-password"
            />
            {feedback && (
              <p
                className={`text-sm ${feedback.type === "success"
                  ? "text-emerald-400"
                  : "text-red-400"
                  }`}
              >
                {feedback.text}
              </p>
            )}
            <Button
              type="submit"
              className="rounded-md p-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <footer className="text-center text-sm text-[#999999]">
            Não possui conta?{" "}
            <a
              className="font-medium text-[#05DBF2] hover:underline"
              href="/cadastro"
            >
              Crie uma aqui
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
