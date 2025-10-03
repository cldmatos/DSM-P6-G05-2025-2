"use client";

import { forwardRef, InputHTMLAttributes } from "react";

type InputProps = {
  label?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label ? (
          <label htmlFor={id} className="block text-sm font-medium text-[#eeeedd]">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-md border border-[#999999] bg-[#1A1A1A] px-3 py-2 text-[#eeeedd] placeholder-[#999999] focus:border-[#05DBF2] focus:outline-none focus:ring-2 focus:ring-[#05DBF2] disabled:cursor-not-allowed disabled:bg-[#999999]/30 disabled:text-[#1A1A1A] ${className}`}
          {...props}
        />
        {error ? <p className="text-sm text-[#0788D9]">{error}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
