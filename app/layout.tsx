"use client";

import "@/app/globals.css";
import { AppProvider, useApp } from "@/app/context/AppContext";

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { lang, setLang, isDark, setIsDark, mounted } = useApp();

  if (!mounted) {
    return <body className="bg-[#0a0a0a] min-h-screen" />;
  }

  const themeClass = isDark
    ? "bg-[#0a0a0a] text-zinc-300"
    : "bg-[#f4f4f5] text-zinc-700";
  const textHighlight = isDark ? "text-zinc-100" : "text-zinc-900";
  const borderClass = isDark ? "border-zinc-800/50" : "border-zinc-300";

  return (
    <body
      className={`${themeClass} min-h-screen p-4 md:p-16 font-sans transition-colors duration-300 selection:bg-zinc-500/30`}
    >
      <nav className="max-w-4xl mx-auto flex justify-end gap-5 mb-6">
        {/* Toggle Language Icon */}
        <button
          onClick={() => setLang(lang === "en" ? "id" : "en")}
          className={`px-3 py-2 text-xs font-bold tracking-widest rounded-md hover:bg-zinc-500/10 transition-colors ${isDark ? "text-zinc-400 hover:text-zinc-100" : "text-zinc-500 hover:text-zinc-900"}`}
          title="Switch Language"
        >
          {lang === "en" ? "ID" : "EN"}
        </button>

        {/* Toggle Theme Icon (Tetap sama) */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-2 rounded-md hover:bg-zinc-500/10 transition-colors ${isDark ? "text-zinc-400 hover:text-zinc-100" : "text-zinc-500 hover:text-zinc-900"}`}
          title="Toggle Theme"
        >
          {isDark ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14.142 14.142a4 4 0 11-5.657-5.657 4 4 0 015.657 5.657z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </nav>

      <header
        className={`max-w-4xl mx-auto mb-12 flex items-center justify-between border-b ${borderClass} pb-6`}
      >
        {/* Judul Bilingual */}
        <h1
          className={`text-xl font-medium tracking-[0.15em] ${textHighlight} uppercase`}
        >
          {lang === "id" ? "Hitung " : "Cekih "}
          <span className="text-zinc-500 font-light">
            {lang === "id" ? "Cekih" : "Tracker"}
          </span>
        </h1>
      </header>

      {children}
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
