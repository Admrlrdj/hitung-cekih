"use client";

import "@/app/globals.css";
import { AppProvider, useApp } from "@/app/context/AppContext";

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { lang, setLang, mounted } = useApp();

  if (!mounted) {
    return <body className="bg-zinc-950 min-h-screen" />;
  }

  return (
    <body className="bg-zinc-950 text-zinc-300 min-h-screen font-sans selection:bg-zinc-500/30 pb-24 sm:pb-12">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12">
        <header className="flex items-center justify-between mb-12 border-b border-zinc-800/60 pb-6">
          <h1 className="text-xl font-bold tracking-[0.15em] text-zinc-100 uppercase drop-shadow-md">
            {lang === "id" ? "Hitung " : "Cekih "}
            <span className="text-zinc-500 font-light">
              {lang === "id" ? "Cekih" : "Tracker"}
            </span>
          </h1>
          <button
            onClick={() => setLang(lang === "en" ? "id" : "en")}
            className="px-3 py-2 text-xs font-bold tracking-widest rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 text-zinc-400 transition-all active:scale-95"
            title="Switch Language"
          >
            {lang === "en" ? "ID" : "EN"}
          </button>
        </header>

        {children}
      </div>
    </body>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AppProvider>
        <RootLayoutContent>{children}</RootLayoutContent>
      </AppProvider>
    </html>
  );
}
