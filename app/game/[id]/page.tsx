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

  // State untuk melacak skor mana yang sedang diedit
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

  // Fungsi baru untuk menyimpan edit skor spesifik
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScore) return;

    const updatedRounds = [...rounds];
    // Copy array spesifik agar state benar-benar terupdate (immutable)
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
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      {burnNotifications.map((note, i) => (
        <div
          key={i}
          className="border-l-2 border-red-500 p-3 text-xs tracking-wide bg-red-500/5 text-red-400"
        >
          {note}
        </div>
      ))}

      {/* Responsive Table Container */}
      <div className="overflow-x-auto border rounded-sm border-zinc-800/40">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b text-zinc-500 text-[11px] tracking-widest uppercase border-zinc-800/80">
              <th className="py-4 px-3 w-16 text-center sticky left-0 z-10 border-r bg-[#0a0a0a] border-zinc-800/80">
                {t.round}
              </th>
              {players.map((name, i) => {
                const leader = currentTotals[i] === maxScore && maxScore > 0;
                return (
                  <th key={i} className="py-4 px-4 font-normal">
                    <div className="flex items-center gap-2">
                      <span
                        className={leader ? "text-zinc-100" : "text-zinc-400"}
                      >
                        {name}
                      </span>
                      {leader && (
                        <div className="w-1 h-1 bg-amber-500 rounded-full" />
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
                className="border-b hover:bg-zinc-500/5 border-zinc-900/30"
              >
                <td className="py-3 px-3 text-center text-zinc-600 sticky left-0 z-10 border-r bg-[#0a0a0a] border-zinc-900/30">
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
                    className={`py-3 px-4 cursor-pointer hover:bg-zinc-800/40 transition-colors ${score < 0 ? "text-red-400" : score > 0 ? "text-zinc-100" : "text-zinc-600"}`}
                    title={t.editScore}
                  >
                    {score > 0 ? `+${score}` : score}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-zinc-500/5 text-xs border-zinc-700">
              <td className="py-5 px-3 font-sans text-[11px] uppercase tracking-widest text-zinc-500 text-center sticky left-0 z-10 border-r bg-[#0a0a0a] border-zinc-700">
                {t.total}
              </td>
              {currentTotals.map((total, i) => (
                <td key={i} className="py-5 px-4 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-amber-500">
                      {total}
                    </span>
                    {total === 0 && rounds.length > 1 && (
                      <span className="text-[9px] text-red-400 border border-red-500/20 px-1 rounded-sm uppercase">
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

      {/* Fixed/Sticky Action Buttons on Mobile */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-800/40">
        <button
          onClick={() => setShowScoreModal(true)}
          className="w-full sm:w-auto px-8 py-4 text-xs tracking-widest uppercase font-medium transition-colors bg-zinc-100 text-zinc-950 hover:bg-white"
        >
          {t.add}
        </button>
        <button
          onClick={handleReset}
          className="w-full sm:w-auto px-6 py-4 text-xs tracking-widest uppercase border transition-colors border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
        >
          {t.reset}
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full sm:w-auto sm:ml-auto px-6 py-4 text-xs tracking-widest uppercase text-center transition-colors text-zinc-500 hover:text-zinc-300"
        >
          {t.exit}
        </button>
      </div>

      {/* Input Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50 bg-black/80">
          <div className="bg-[#0f0f0f] border-zinc-800 border w-full max-w-sm p-6 shadow-2xl">
            <form onSubmit={handleAddScore} className="space-y-5">
              {players.map((name, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b pb-2 border-zinc-800/40"
                >
                  <span className="text-xs uppercase tracking-wider text-zinc-500">
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
                    className="w-20 bg-transparent text-right text-sm font-mono focus:outline-none text-zinc-100"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-4 text-xs uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => setShowScoreModal(false)}
                  className="flex-1 py-3 border border-zinc-800 text-zinc-500 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-zinc-100 text-zinc-950"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Score Modal */}
      {editingScore && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50 bg-black/80">
          <div className="bg-[#0f0f0f] border-zinc-800 border w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div className="text-center mb-4">
                <h3 className="text-sm font-medium text-zinc-100 uppercase tracking-widest">
                  {t.editScore} - {players[editingScore.playerIdx]}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Round {editingScore.roundIdx + 1}
                </p>
              </div>
              <div className="flex justify-center">
                <input
                  type="number"
                  value={editingScore.value}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  onChange={(e) =>
                    setEditingScore({ ...editingScore, value: e.target.value })
                  }
                  className="w-full text-center bg-transparent border-b border-zinc-800 py-3 text-2xl font-mono focus:outline-none text-zinc-100 focus:border-zinc-500 transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-4 text-xs uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => setEditingScore(null)}
                  className="flex-1 py-3 border border-zinc-800 text-zinc-500 hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-zinc-100 text-zinc-950 transition-colors hover:bg-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 500 Threshold Modal */}
      {showFiveHundredModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 bg-black/90">
          <div className="w-full max-w-sm text-center">
            <h3 className="text-xl font-light mb-3 tracking-wide text-zinc-100">
              {t.limitTitle}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed mb-8">
              {t.limitDesc}
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto text-xs uppercase tracking-widest">
              <button
                onClick={() => setShowFiveHundredModal(false)}
                className="w-full py-4 bg-zinc-100 text-zinc-950"
              >
                {t.cont}
              </button>
              <button
                onClick={() => {
                  saveUpdate(rounds, true);
                  router.push("/history");
                }}
                className="w-full py-4 border border-zinc-800 text-zinc-400 hover:bg-zinc-900"
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
