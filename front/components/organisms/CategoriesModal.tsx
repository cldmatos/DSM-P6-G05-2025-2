"use client";

import Button from "@/components/atoms/Button";
import CheckBox from "@/components/atoms/CheckBox";

type CategoriesModalProps = {
  open: boolean;
  categories: string[];
  selected: string[];
  onToggle: (value: string, checked: boolean) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onClose: () => void;
  formatLabel?: (value: string) => string;
};

export default function CategoriesModal({
  open,
  categories,
  selected,
  onToggle,
  onSelectAll,
  onClear,
  onClose,
  formatLabel,
}: CategoriesModalProps) {
  if (!open) return null;

  const resolveLabel =
    formatLabel ??
    ((value: string) =>
      value
        .replace(/[_-]/g, " ")
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "));

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-[#1A1A1A] p-6 shadow-2xl"
        onClick={handleContentClick}
      >
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#05DBF2]">
            Selecione os gêneros
          </h2>
          <button
            type="button"
            className="text-sm text-[#999999] hover:text-[#eeeedd]"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </header>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="rounded-md bg-[#0788D9]/80 px-3 py-1 text-sm text-white hover:bg-[#0788D9]"
            onClick={onSelectAll}
          >
            Selecionar todos
          </Button>
          <Button
            type="button"
            className="rounded-md bg-transparent px-3 py-1 text-sm text-[#F25F4C] hover:text-[#F25F4C]/80"
            onClick={onClear}
          >
            Limpar seleção
          </Button>
        </div>

        <div className="mt-6 max-h-72 space-y-2 overflow-y-auto pr-1">
          {categories.map((category) => (
            <CheckBox
              key={category}
              id={`modal-category-${category}`}
              label={resolveLabel(category)}
              value={category}
              checked={selected.includes(category)}
              onChange={(checked) => onToggle(category, checked)}
            />
          ))}
          {!categories.length && (
            <p className="text-sm text-[#999999]">
              Nenhuma categoria disponível.
            </p>
          )}
        </div>

        <footer className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md px-4 py-2 text-sm text-[#999999] hover:text-[#eeeedd]"
            onClick={onClose}
          >
            Cancelar
          </button>
          <Button
            type="button"
            className="rounded-md bg-[#05DBF2] px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#05DBF2]/80"
            onClick={onClose}
          >
            Aplicar seleção
          </Button>
        </footer>
      </div>
    </div>
  );
}
