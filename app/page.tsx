"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const { lang } = useApp();
  const [hasActiveGame, setHasActiveGame] = useState(false);

  useEffect(() => {
    const active = localStorage.getItem("cekih_active_session");
    if (active) setHasActiveGame(true);
  }, []);

  const labels = {
    en: {
      continue: "Continue Session",
      newGame: "New Game",
      history: "History",
      noActive: "No active session available",
    },
    id: {
      continue: "Lanjutkan Sesi",
      newGame: "Sesi Baru",
      history: "Riwayat",
      noActive: "Tidak ada sesi aktif",
    },
  }[lang];

  return (
    <div className="max-w-xs mx-auto mt-20 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <button
        onClick={() => {
          const active = localStorage.getItem("cekih_active_session");
          if (active) {
            const parsed = JSON.parse(active);
            router.push(`/game/${parsed.id}`);
          } else {
            alert(labels.noActive);
          }
        }}
        disabled={!hasActiveGame}
        className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold tracking-widest uppercase text-xs py-5 rounded-2xl transition-all shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-20 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {labels.continue}
      </button>
      <button
        onClick={() => router.push("/game/setup")}
        className="w-full border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 font-medium tracking-widest uppercase text-xs py-5 rounded-2xl transition-all active:scale-95"
      >
        {labels.newGame}
      </button>
      <button
        onClick={() => router.push("/history")}
        className="w-full border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 font-medium tracking-widest uppercase text-xs py-5 rounded-2xl transition-all active:scale-95"
      >
        {labels.history}
      </button>
    </div>
  );
}
