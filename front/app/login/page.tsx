import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Image from "next/image";

export default function LoginPage() {
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

          <form className="space-y-4 rounded-md bg-[#0788D9]/10 p-6 shadow-lg">
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
              autoComplete="current-password"
            />
            <Button type="submit" className="rounded-md p-2">
              Entrar
            </Button>
          </form>

          <footer className="text-center text-sm text-[#999999]">
            Não possui conta?{" "}
            <a className="font-medium text-[#05DBF2] hover:underline" href="/cadastro">
              Crie uma aqui
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
