"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";

export default function GameSetup() {
  const router = useRouter();
  const { lang } = useApp();
  const [players, setPlayers] = useState<string[]>(["", "", "", ""]);

  const text = {
    en: {
      title: "New Session",
      desc: "Enter names for the four players.",
      start: "Start Session",
      cancel: "Cancel",
    },
    id: {
      title: "Sesi Baru",
      desc: "Masukkan nama keempat pemain.",
      start: "Mulai Sesi",
      cancel: "Batal",
    },
  }[lang];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (players.some((p) => p.trim() === "")) return;

    const gameCode = Date.now().toString();
    const sessionData = {
      id: gameCode,
      date: new Date().toISOString(),
      players,
      rounds: [[0, 0, 0, 0]],
      isFinished: false,
    };

    localStorage.setItem("cekih_active_session", JSON.stringify(sessionData));
    router.push(`/game/${gameCode}`);
  };

  return (
    <div className="max-w-sm mx-auto mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-zinc-100 tracking-wide mb-2 drop-shadow-md">
          {text.title}
        </h2>
        <p className="text-sm text-zinc-500">{text.desc}</p>
      </div>
      <form onSubmit={handleStart} className="space-y-4">
        {players.map((name, idx) => (
          <input
            key={idx}
            type="text"
            required
            placeholder={
              lang === "en" ? `Player ${idx + 1}` : `Pemain ${idx + 1}`
            }
            value={name}
            onChange={(e) => {
              const p = [...players];
              p[idx] = e.target.value;
              setPlayers(p);
            }}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-zinc-900 transition-all shadow-inner"
          />
        ))}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold tracking-widest uppercase text-xs py-5 rounded-2xl transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] active:scale-95"
          >
            {text.start}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full text-xs font-medium tracking-widest uppercase text-zinc-500 hover:text-zinc-300 mt-4 py-3 rounded-2xl transition-colors active:scale-95"
          >
            {text.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
