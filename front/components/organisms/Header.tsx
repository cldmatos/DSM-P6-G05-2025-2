"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import DropDown from "../molecules/DropDown";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/jogos", label: "Jogos" },
    { href: "/sobre", label: "Sobre" },
  ];

  const userMenuItems = [
    { label: "Perfil", href: "/usuario" },
    { label: "Sair", href: "/login" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f] shadow-md">
      <div className="container px-4">
        <div className="flex h-16 items-center">
          <button
            className="lg:hidden text-[#eeeedd] hover:text-[#05DBF2] transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          <div className="absolute right-4 flex items-center space-x-4">
            <nav className="hidden lg:flex space-x-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white no-underline hover:text-[#05DBF2] transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <DropDown
              trigger={<UserIcon className="h-6 w-6" />}
              items={userMenuItems}
            />

            <Link
              href="/"
              className="text-[#05DBF2] text-2xl font-bold no-underline hover:text-[#05DBF2]/90 transition-colors"
            >
              <Image
                src={"/Icon.svg"}
                width={48}
                height={48}
                alt={"Logo do App"}
                quality={100}
              />
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden pb-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white no-underline hover:text-[#05DBF2] transition-colors text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
