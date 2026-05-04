import { crosswordTiles, memoryPrompts } from "@/lib/landing-content";

const tileTone = {
  accent: "bg-accent text-white shadow-[0_10px_24px_rgba(155,31,60,0.22)]",
  gold: "bg-gold text-white shadow-[0_10px_24px_rgba(215,169,79,0.24)]",
  rose: "bg-surface-rose text-accent",
  ivory: "bg-surface text-foreground",
  empty: "bg-transparent shadow-none",
};

export function CrosswordPreview() {
  return (
    <div
      id="bulmaca-onizleme"
      className="preview-shell float-soft relative mx-auto min-w-0"
      aria-label="Kişiye özel romantik bulmaca önizlemesi"
    >
      <div className="absolute -left-8 top-10 h-28 w-28 rounded-full bg-accent-soft/35 blur-2xl" />
      <div className="absolute -right-7 bottom-8 h-36 w-36 rounded-full bg-gold/20 blur-2xl" />

      <div className="relative min-w-0 rounded-[2rem] border border-white/80 bg-surface/82 p-2 shadow-[0_35px_90px_rgba(80,35,42,0.18)] backdrop-blur sm:rounded-[2.5rem] sm:p-5 md:p-7">
        <div className="min-w-0 rounded-[1.6rem] border border-border bg-[#fffaf5] p-3 sm:rounded-[2rem] sm:p-5 md:p-7">
          <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6 sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent sm:text-sm sm:tracking-[0.28em]">
                Özel taslak
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold leading-none tracking-[-0.04em] sm:text-4xl">
                Aşkın küçük haritası
              </h2>
            </div>
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-xl text-white sm:size-14 sm:text-2xl">
              ♥
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-7 gap-1 sm:gap-2" aria-hidden="true">
            {crosswordTiles.map((tile, index) => (
              <div
                key={`${tile.letter}-${index}`}
                className={`grid aspect-square min-w-0 place-items-center rounded-md text-xs font-black uppercase shadow-[0_8px_20px_rgba(80,35,42,0.08)] sm:rounded-xl sm:text-lg ${
                  tileTone[tile.tone]
                }`}
              >
                {tile.letter}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2 sm:mt-7 sm:gap-3">
            {memoryPrompts.map((prompt) => (
              <div
                className="rounded-2xl border border-border bg-white/70 p-3 sm:p-4"
                key={prompt.title}
              >
                <p className="text-sm font-extrabold text-foreground">
                  {prompt.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {prompt.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
