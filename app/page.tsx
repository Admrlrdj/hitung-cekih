"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const { lang, isDark } = useApp();
  const [hasActiveGame, setHasActiveGame] = useState(false);

  useEffect(() => {
    const active = localStorage.getItem("cekih_active_session");
    if (active) setHasActiveGame(true);
  }, []);

  const labels = {
    en: {
      continue: "Continue",
      newGame: "New Game",
      history: "History",
      noActive: "No active session available",
    },
    id: {
      continue: "Lanjutkan",
      newGame: "Sesi Baru",
      history: "Riwayat",
      noActive: "Tidak ada sesi aktif",
    },
  }[lang];

  const btnPrimary = isDark
    ? "bg-zinc-100 hover:bg-white text-zinc-950"
    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-50";
  const btnSecondary = isDark
    ? "hover:bg-zinc-900 text-zinc-400 border-zinc-800"
    : "hover:bg-zinc-200 text-zinc-600 border-zinc-300";

  const handleContinue = () => {
    const active = localStorage.getItem("cekih_active_session");
    if (active) {
      const parsed = JSON.parse(active);
      router.push(`/game/${parsed.id}`);
    } else {
      alert(labels.noActive);
    }
  };

  return (
    <div className="max-w-xs mx-auto mt-24 flex flex-col gap-5 animate-in fade-in duration-300">
      <button
        onClick={handleContinue}
        disabled={!hasActiveGame}
        className={`w-full ${btnPrimary} font-medium tracking-widest uppercase text-xs py-5 transition-all duration-300 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {labels.continue}
      </button>
      <button
        onClick={() => router.push("/game/setup")}
        className={`w-full border ${btnSecondary} font-medium tracking-widest uppercase text-xs py-5 transition-all duration-300`}
      >
        {labels.newGame}
      </button>
      <button
        onClick={() => router.push("/history")}
        className={`w-full border ${btnSecondary} font-medium tracking-widest uppercase text-xs py-5 transition-all duration-300`}
      >
        {labels.history}
      </button>
    </div>
  );
}
