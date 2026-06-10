"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";

export default function GameSetup() {
    const router = useRouter();
    const { lang, isDark } = useApp();
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

    const borderClass = isDark
        ? "border-zinc-800 focus:border-zinc-400"
        : "border-zinc-300 focus:border-zinc-600";
    const textClass = isDark ? "text-zinc-100" : "text-zinc-900";

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
        <div className="max-w-sm mx-auto mt-16 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-10 text-center">
                <h2 className={`text-2xl font-light ${textClass} tracking-wide mb-2`}>
                    {text.title}
                </h2>
                <p className="text-sm text-zinc-500">{text.desc}</p>
            </div>
            <form onSubmit={handleStart} className="space-y-5">
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
                        className={`w-full bg-transparent border-b ${borderClass} py-3 text-base ${textClass} placeholder-zinc-500 focus:outline-none transition-colors`}
                    />
                ))}
                <button
                    type="submit"
                    className={`w-full mt-6 ${isDark ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-50"} font-medium tracking-widest uppercase text-xs py-4 transition-all`}
                >
                    {text.start}
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="w-full text-xs tracking-widest uppercase text-zinc-500 hover:text-zinc-400 mt-2 py-2"
                >
                    {text.cancel}
                </button>
            </form>
        </div>
    );
}
