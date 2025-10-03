"use client";

interface CheckBoxProps {
  id: string;
  label: string;
  value: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function CheckBox({ id, label, value, checked = false, onChange }: CheckBoxProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        value={value}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 rounded border-[#0788D9]/30 bg-[#1A1A1A] text-[#05DBF2] accent-[#05DBF2] focus:ring-2 focus:ring-[#05DBF2]/50 focus:ring-offset-0 cursor-pointer"
      />
      <label
        htmlFor={id}
        className="text-sm text-[#eeeedd] cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
  );
}
