"use client";

import "@/app/globals.css";
import { AppProvider, useApp } from "@/app/context/AppContext";

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { lang, setLang, mounted } = useApp();

  if (!mounted) {
    return <body className="bg-[#0a0a0a] min-h-screen" />;
  }

  return (
    <body className="bg-[#0a0a0a] text-zinc-300 min-h-screen p-4 md:p-16 font-sans transition-colors duration-300 selection:bg-zinc-500/30">
      <nav className="max-w-4xl mx-auto flex justify-end gap-5 mb-6">
        {/* Toggle Language Icon */}
        <button
          onClick={() => setLang(lang === "en" ? "id" : "en")}
          className="px-3 py-2 text-xs font-bold tracking-widest rounded-md hover:bg-zinc-500/10 transition-colors text-zinc-400 hover:text-zinc-100"
          title="Switch Language"
        >
          {lang === "en" ? "ID" : "EN"}
        </button>
      </nav>

      <header className="max-w-4xl mx-auto mb-12 flex items-center justify-between border-b border-zinc-800/50 pb-6">
        <h1 className="text-xl font-medium tracking-[0.15em] text-zinc-100 uppercase">
          {lang === "id" ? "Hitung " : "Cekih "}
          <span className="text-zinc-500 font-light">
            {lang === "id" ? "Cekih" : "Counter"}
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
