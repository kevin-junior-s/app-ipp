"use client";

import { useEffect, useState } from "react";

type ThemeChoice = "auto" | "light" | "dark";

const OPTIONS: { id: ThemeChoice; label: string }[] = [
  { id: "auto", label: "Ikut sistem" },
  { id: "light", label: "Terang" },
  { id: "dark", label: "Gelap" },
];

function apply(choice: ThemeChoice) {
  if (choice === "auto") {
    delete document.documentElement.dataset.theme;
    localStorage.setItem("lt-theme", "auto");
  } else {
    document.documentElement.dataset.theme = choice;
    localStorage.setItem("lt-theme", choice);
  }
}

/** Pilihan tema tiga arah; disimpan di localStorage, diterapkan via [data-theme]. */
export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>("auto");

  useEffect(() => {
    const saved = localStorage.getItem("lt-theme");
    if (saved === "light" || saved === "dark" || saved === "auto") setChoice(saved);
  }, []);

  return (
    <div className="inline-flex gap-1 p-1 rounded-[10px] bg-fill" role="radiogroup" aria-label="Tema tampilan">
      {OPTIONS.map((o) => {
        const active = choice === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              setChoice(o.id);
              apply(o.id);
            }}
            className={`px-3.5 h-8 rounded-[8px] text-[13px] font-medium transition-colors ${
              active ? "bg-surface text-label border border-separator" : "text-secondary hover:text-label"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
