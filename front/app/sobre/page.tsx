"use client";

import Button from "@/components/atoms/Button";
import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  const teamMembers = [
    {
      name: "Kauê José",
      role: "Desenvolvedor",
      image: "/kaue.jpg",
    },
    {
      name: "Claudio Matos",
      role: "Desenvolvedor",
      image: "/claudio.jpg",
    },
    {
      name: "João Pedro",
      role: "Desenvolvedor",
      image: "/joao.jpg",
    },
    {
      name: "Leonardo Victor",
      role: "Desenvolvedor",
      image: "/leo.jpg",
    }
  ];

  const handleExploreGames = () => {
    router.push("/jogos");
  };

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen">
        <section className="relative px-4 py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-center bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient leading-tight py-2">
              Sobre o Game List
            </h1>
          </div>
        </section>

        <section className="px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-background via-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 border border-primary/20 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Recomendações Inteligentes
              </h2>
              <div className="space-y-4 text-foreground/90 text-base md:text-lg leading-relaxed">
                <p>
                  Nosso aplicativo revoluciona a forma como você descobre novos jogos.
                  Utilizando <span className="text-primary font-semibold">inteligência artificial avançada</span>,
                  analisamos suas preferências e avaliações para oferecer
                  recomendações personalizadas e precisas.
                </p>
                <p>
                  Através de algoritmos de <span className="text-secondary font-semibold">machine learning</span>,
                  nosso sistema aprende continuamente com suas interações, refinando as sugestões
                  para garantir que você encontre exatamente o tipo de jogo que procura.
                </p>
                <p>
                  Seja você fã de RPG, shooters competitivos ou jogos indies,
                  nossa plataforma conecta você aos títulos perfeitos para
                  seu perfil de jogador.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:py-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Nossa Equipe
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-background to-primary/10 rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(5,219,242,0.3)] hover:-translate-y-2"
                >
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/30 group-hover:border-primary transition-colors duration-300">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Image
                        src={teamMembers[index].image}
                        width={150}
                        height={150}
                        alt={"Integrante da equipe"}
                        quality={100}
                      />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-center mb-2 text-foreground">
                    {member.name}
                  </h3>

                  <p className="text-primary text-center font-semibold mb-3">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl p-4 md:p-12 border border-primary/30">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Pronto para começar?
              </h2>
              <Button
                onClick={handleExploreGames}
                className="bg-gradient-to-r from-primary to-secondary text-background font-bold py-4 rounded-full text-lg hover:shadow-[0_0_30px_rgba(5,219,242,0.5)] transition-all duration-300 hover:scale-105"
              >
                Explorar Jogos
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
