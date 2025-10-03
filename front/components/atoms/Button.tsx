"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = {
  variant?: "primary" | "secondary";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "w-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1A] cursor-pointer hover:text-white",
        variant === "primary"
          ? "bg-[#05DBF2] text-[#1A1A1A] hover:bg-[#05DBF2]/90 focus:ring-[#05DBF2]"
          : "bg-[#0788D9] text-[#eeeedd] hover:bg-[#0788D9]/90 focus:ring-[#0788D9]",
        "disabled:cursor-not-allowed disabled:bg-[#999999] disabled:text-[#1A1A1A]",
        className
      )}
      {...props}
    />
  );
}
