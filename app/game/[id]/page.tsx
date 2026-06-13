"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GameBoard({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { lang } = useApp();

  const [players, setPlayers] = useState<string[]>([]);
  const [rounds, setRounds] = useState<number[][]>([]);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showFiveHundredModal, setShowFiveHundredModal] = useState(false);
  const [currentRoundInput, setCurrentRoundInput] = useState<string[]>([
    "0",
    "0",
    "0",
    "0",
  ]);
  const [burnNotifications, setBurnNotifications] = useState<string[]>([]);
  const [editingScore, setEditingScore] = useState<{
    roundIdx: number;
    playerIdx: number;
    value: string;
  } | null>(null);

  const t = {
    en: {
      round: "Rd",
      total: "Total",
      burned: "Burned",
      add: "New Score",
      reset: "Reset Game",
      exit: "Exit",
      msgBurn: "was reset to 0",
      msgAllReset: "All points cleared",
      limitTitle: "Limit Reached",
      limitDesc: "A player hit 500 points. Continue or finish?",
      cont: "Continue",
      end: "Finish Game",
      editScore: "Edit Score",
    },
    id: {
      round: "Rnd",
      total: "Total",
      burned: "Bakar",
      add: "Input Skor",
      reset: "Reset Poin",
      exit: "Keluar",
      msgBurn: "direset ke 0",
      msgAllReset: "Semua skor dibakar",
      limitTitle: "Batas Tercapai",
      limitDesc: "Pemain mencapai 500 poin. Lanjut atau selesaikan?",
      cont: "Lanjutkan",
      end: "Selesai",
      editScore: "Edit Skor",
    },
  }[lang];

  useEffect(() => {
    const active = localStorage.getItem("cekih_active_session");
    if (active) {
      const parsed = JSON.parse(active);
      if (parsed.id === id) {
        setPlayers(parsed.players);
        setRounds(parsed.rounds);
        return;
      }
    }

    const historyData = localStorage.getItem("cekih_history");
    if (historyData) {
      const records = JSON.parse(historyData);
      const match = records.find((r: any) => r.id === id);
      if (match) {
        setPlayers(match.players);
        setRounds(match.rounds);
      }
    }
  }, [id]);

  const calculateTotals = (currentRounds: number[][]) => {
    const totals = [0, 0, 0, 0];
    currentRounds.forEach((round) => {
      for (let i = 0; i < 4; i++) totals[i] += round[i];
    });
    return totals;
  };

  const currentTotals = calculateTotals(rounds);
  const maxScore = Math.max(...currentTotals);

  const saveUpdate = (updatedRounds: number[][], finished = false) => {
    const session = {
      id,
      date: new Date().toISOString(),
      players,
      rounds: updatedRounds,
      isFinished: finished,
    };

    if (!finished) {
      localStorage.setItem("cekih_active_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("cekih_active_session");
    }

    const historyData = localStorage.getItem("cekih_history");
    let history = historyData ? JSON.parse(historyData) : [];
    history = history.filter((h: any) => h.id !== id);
    localStorage.setItem(
      "cekih_history",
      JSON.stringify([session, ...history]),
    );
  };

  const handleAddScore = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = currentRoundInput.map((v) => parseInt(v) || 0);
    const tentative = currentTotals.map((c, i) => c + parsed[i]);
    const maxTentative = Math.max(...tentative);
    const finalRound = [...parsed];
    const alerts: string[] = [];

    currentTotals.forEach((old, idx) => {
      if (old > 100 && maxTentative > tentative[idx]) {
        finalRound[idx] = -old;
        alerts.push(`${players[idx]} ${t.msgBurn}`);
      }
    });

    const updated = [...rounds, finalRound];
    setRounds(updated);
    setBurnNotifications(alerts);
    setShowScoreModal(false);
    setCurrentRoundInput(["0", "0", "0", "0"]);

    const nextTotals = calculateTotals(updated);
    const hit500 = nextTotals.some((s) => s >= 500);
    saveUpdate(updated, hit500 ? false : false);

    if (hit500) setShowFiveHundredModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScore) return;

    const updatedRounds = [...rounds];
    updatedRounds[editingScore.roundIdx] = [
      ...updatedRounds[editingScore.roundIdx],
    ];
    updatedRounds[editingScore.roundIdx][editingScore.playerIdx] =
      parseInt(editingScore.value) || 0;

    setRounds(updatedRounds);
    setEditingScore(null);

    const nextTotals = calculateTotals(updatedRounds);
    const hit500 = nextTotals.some((s) => s >= 500);
    saveUpdate(updatedRounds, hit500 ? false : false);

    if (hit500) setShowFiveHundredModal(true);
  };

  const handleReset = () => {
    const reset = currentTotals.map((s) => -s);
    const updated = [...rounds, reset];
    setRounds(updated);
    setBurnNotifications([t.msgAllReset]);
    saveUpdate(updated);
  };

  if (players.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      {burnNotifications.map((note, i) => (
        <div
          key={i}
          className="border border-red-500/30 rounded-xl p-4 text-xs tracking-wide bg-red-500/10 text-red-400 shadow-sm animate-in slide-in-from-top-2"
        >
          {note}
        </div>
      ))}

      {/* Tabel Permainan Premium */}
      <div className="overflow-x-auto bg-zinc-900/40 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur-md">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b text-zinc-500 text-[11px] tracking-widest uppercase border-zinc-800/80 bg-zinc-900/50">
              <th className="py-5 px-3 w-16 text-center sticky left-0 z-10 border-r bg-zinc-900 border-zinc-800/80">
                {t.round}
              </th>
              {players.map((name, i) => {
                const leader = currentTotals[i] === maxScore && maxScore > 0;
                return (
                  <th key={i} className="py-5 px-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <span
                        className={leader ? "text-zinc-100" : "text-zinc-400"}
                      >
                        {name}
                      </span>
                      {leader && (
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {rounds.map((round, rIdx) => (
              <tr
                key={rIdx}
                className="border-b hover:bg-zinc-800/30 border-zinc-800/50 transition-colors"
              >
                <td className="py-4 px-3 text-center text-zinc-500 sticky left-0 z-10 border-r bg-zinc-950 border-zinc-800/50">
                  {rIdx + 1}
                </td>
                {round.map((score, pIdx) => (
                  <td
                    key={pIdx}
                    onClick={() =>
                      setEditingScore({
                        roundIdx: rIdx,
                        playerIdx: pIdx,
                        value: score.toString(),
                      })
                    }
                    className={`py-4 px-4 cursor-pointer rounded-lg m-1 hover:bg-zinc-700/40 transition-colors ${score < 0 ? "text-red-400" : score > 0 ? "text-emerald-400" : "text-zinc-500"}`}
                    title={t.editScore}
                  >
                    {score > 0 ? `+${score}` : score}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-zinc-900/80 text-xs border-zinc-700 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)]">
              <td className="py-6 px-3 font-sans font-bold text-[11px] uppercase tracking-widest text-zinc-400 text-center sticky left-0 z-10 border-r bg-zinc-900 border-zinc-700">
                {t.total}
              </td>
              {currentTotals.map((total, i) => (
                <td key={i} className="py-6 px-4 font-mono text-base">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="font-bold text-amber-500 drop-shadow-md">
                      {total}
                    </span>
                    {total === 0 && rounds.length > 1 && (
                      <span className="text-[9px] text-red-400 border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 rounded-md uppercase">
                        {t.burned}
                      </span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Floating Bottom Bar (HP Friendly) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/60 z-30 flex gap-3 sm:static sm:bg-transparent sm:border-none sm:p-0 sm:pt-4 sm:flex-row shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.5)] sm:shadow-none">
        <button
          onClick={() => setShowScoreModal(true)}
          className="flex-[2] sm:flex-none sm:px-10 py-4 text-xs font-bold tracking-widest uppercase transition-all bg-zinc-100 text-zinc-950 hover:bg-white rounded-2xl active:scale-95 shadow-lg"
        >
          {t.add}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 sm:flex-none sm:px-8 py-4 text-xs font-bold tracking-widest uppercase border transition-all border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-2xl active:scale-95"
        >
          {t.reset}
        </button>
        <button
          onClick={() => router.push("/")}
          className="flex-1 sm:flex-none sm:ml-auto sm:px-8 py-4 text-xs font-bold tracking-widest uppercase text-center transition-all bg-zinc-900/30 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-2xl active:scale-95"
        >
          {t.exit}
        </button>
      </div>

      {/* Input Score Modal Premium */}
      {showScoreModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-50 bg-black/60 transition-opacity">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm p-6 sm:p-8 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <h3 className="text-lg font-light text-zinc-100 mb-6 text-center tracking-wide">
              {t.add}
            </h3>
            <form onSubmit={handleAddScore} className="space-y-3">
              {players.map((name, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 px-5 transition-colors focus-within:border-zinc-500 focus-within:bg-zinc-900"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {name}
                  </span>
                  <input
                    type="number"
                    pattern="[0-9]*"
                    value={currentRoundInput[idx]}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    onChange={(e) => {
                      const i = [...currentRoundInput];
                      i[idx] = e.target.value;
                      setCurrentRoundInput(i);
                    }}
                    className="w-24 bg-transparent text-right text-xl font-mono focus:outline-none text-zinc-100 placeholder-zinc-700"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-6 text-xs font-bold uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => setShowScoreModal(false)}
                  className="flex-1 py-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 rounded-2xl bg-zinc-100 text-zinc-950 hover:bg-white shadow-lg transition-all active:scale-95"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Score Modal Premium */}
      {editingScore && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 bg-black/60">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm p-8 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="text-center">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">
                  {t.editScore}
                </h3>
                <p className="text-lg text-zinc-100">
                  {players[editingScore.playerIdx]}{" "}
                  <span className="text-zinc-600 font-light">
                    • Rnd {editingScore.roundIdx + 1}
                  </span>
                </p>
              </div>
              <div className="flex justify-center bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 focus-within:border-zinc-500 transition-colors">
                <input
                  type="number"
                  value={editingScore.value}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  onChange={(e) =>
                    setEditingScore({ ...editingScore, value: e.target.value })
                  }
                  className="w-full text-center bg-transparent text-4xl font-mono focus:outline-none text-zinc-100"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2 text-xs font-bold uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => setEditingScore(null)}
                  className="flex-1 py-4 rounded-2xl border border-zinc-800 text-zinc-500 hover:bg-zinc-800 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-950 hover:bg-white transition-all active:scale-95"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 500 Threshold Modal Premium */}
      {showFiveHundredModal && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center p-4 z-50 bg-black/80">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm p-8 text-center rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-3 tracking-wide">
              {t.limitTitle}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-8">
              {t.limitDesc}
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto text-xs font-bold uppercase tracking-widest">
              <button
                onClick={() => setShowFiveHundredModal(false)}
                className="w-full py-4 rounded-2xl bg-zinc-100 text-zinc-950 shadow-lg active:scale-95 transition-all"
              >
                {t.cont}
              </button>
              <button
                onClick={() => {
                  saveUpdate(rounds, true);
                  router.push("/history");
                }}
                className="w-full py-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 active:scale-95 transition-all"
              >
                {t.end}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
