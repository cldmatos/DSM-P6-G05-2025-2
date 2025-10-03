import Link from "next/link";
import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/jogos", label: "Jogos" },
    { href: "/sobre", label: "Sobre" },
  ];

  const socialLinks = [
    { href: "", label: "Facebook" },
    { href: "", label: "Twitter" },
    { href: "", label: "Instagram" },
    { href: "", label: "Discord" },
  ];

  return (
    <footer className="bg-[#0f0f0f] mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            <h1 className="text-[#0788D9] font-semibold text-2xl">
              Game List
            </h1>
            <p className="text-[#999999] text-sm leading-relaxed">
              Sua plataforma completa para descobrir e compartilhar os melhores jogos.
            </p>
          </div>

          <div>
            <h3 className="text-[#eeeedd] font-semibold mb-4">Navegação</h3>
            <nav className="flex flex-col space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#999999] hover:text-[#05DBF2] transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-[#eeeedd] font-semibold mb-4">Redes Sociais</h3>
            <div className="flex flex-col space-y-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#999999] hover:text-[#05DBF2] transition-colors text-sm"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[#eeeedd] font-semibold mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2 text-[#999999] text-sm">
                <EnvelopeIcon className="h-5 w-5 flex-shrink-0 text-[#0788D9]" />
                <span>contato@exemplo.com</span>
              </div>
              <div className="flex items-start space-x-2 text-[#999999] text-sm">
                <PhoneIcon className="h-5 w-5 flex-shrink-0 text-[#0788D9]" />
                <span>+55 (16) 12345-6789</span>
              </div>
              <div className="flex items-start space-x-2 text-[#999999] text-sm">
                <MapPinIcon className="h-5 w-5 flex-shrink-0 text-[#0788D9]" />
                <span>Franca - SP, Brasil</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#2a2a2a] my-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-[#999999] text-sm">
            © {currentYear} Todos os direitos reservados.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/privacidade"
              className="text-[#999999] hover:text-[#05DBF2] transition-colors text-sm"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/termos"
              className="text-[#999999] hover:text-[#05DBF2] transition-colors text-sm"
            >
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
