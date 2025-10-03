"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Button from "../atoms/Button";

interface DropDownItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface DropDownProps {
  trigger: React.ReactNode;
  items: DropDownItem[];
}

export default function DropDown({ trigger, items }: DropDownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#eeeedd] hover:text-[#05DBF2] transition-colors rounded-full p-1"
      >
        {trigger}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-md shadow-lg py-1 z-50 border border-[#333]">
          {items.map((item, index) => (
            <div key={index}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-sm text-[#eeeedd] hover:bg-[#05DBF2]/10 hover:text-[#05DBF2] transition-colors no-underline"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#eeeedd] hover:bg-[#05DBF2]/10 hover:text-[#05DBF2] transition-colors"
                >
                  {item.label}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
