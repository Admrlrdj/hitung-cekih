"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";

interface GameSession {
  id: string;
  date: string;
  players: string[];
  rounds: number[][];
  isFinished: boolean;
}

export default function HistoryPage() {
  const router = useRouter();
  const { lang, isDark } = useApp();
  const [history, setHistory] = useState<GameSession[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("cekih_history");
    if (data) setHistory(JSON.parse(data));
  }, []);

  const t = {
    en: {
      title: "History",
      noHistory: "No records found.",
      back: "Menu",
      done: "Finished",
      active: "Unfinished",
    },
    id: {
      title: "Riwayat",
      noHistory: "Belum ada rekaman.",
      back: "Menu",
      done: "Selesai",
      active: "Belum Selesai",
    },
  }[lang];

  const handleRowClick = (session: GameSession) => {
    if (!session.isFinished) {
      localStorage.setItem("cekih_active_session", JSON.stringify(session));
      router.push(`/game/${session.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <h2
          className={`text-xl font-light tracking-wider ${isDark ? "text-zinc-100" : "text-zinc-900"}`}
        >
          {t.title}
        </h2>
        <button
          onClick={() => router.push("/")}
          className="text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-400"
        >
          {t.back}
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-xs text-zinc-500 border border-dashed border-zinc-800/60 p-8 text-center">
          {t.noHistory}
        </p>
      ) : (
        <div className="space-y-4">
          {history.map((session) => {
            const totals = session.players.map((_, pIdx) =>
              session.rounds.reduce((acc, curr) => acc + curr[pIdx], 0),
            );
            return (
              <div
                key={session.id}
                onClick={() => handleRowClick(session)}
                className={`p-5 border ${isDark ? "border-zinc-900 bg-zinc-900/20 hover:border-zinc-700" : "border-zinc-200 bg-white hover:border-zinc-400"} transition-all duration-200 ${!session.isFinished ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className="flex justify-between items-center border-b border-zinc-500/10 pb-3 mb-3">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(session.date).toLocaleDateString()}
                  </span>
                  <span
                    className={`text-[9px] tracking-widest uppercase px-2 py-0.5 border ${session.isFinished ? "border-emerald-500/20 text-emerald-500" : "border-amber-500/30 text-amber-500 animate-pulse"}`}
                  >
                    {session.isFinished ? t.done : t.active}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {session.players.map((name, i) => (
                    <div key={i} className="truncate">
                      <p className="text-[10px] tracking-wider uppercase text-zinc-500 mb-0.5 truncate">
                        {name}
                      </p>
                      <p
                        className={`text-base font-mono ${isDark ? "text-zinc-300" : "text-zinc-800"}`}
                      >
                        {totals[i]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
