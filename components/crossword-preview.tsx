import { getCroppedGrid } from "@/lib/crossword";
import type { CrosswordPuzzle } from "@/types/crossword";

type CrosswordPreviewProps = {
  puzzle: CrosswordPuzzle;
};

const directionLabel = { across: "Yatay", down: "Dikey" } as const;

/** Decorative, already-solved version of the demo puzzle for the hero. */
export function CrosswordPreview({ puzzle }: CrosswordPreviewProps) {
  const cropped = getCroppedGrid(puzzle);
  const startNumbers = new Set(puzzle.placedWords.map((word) => word.number));
  const highlightedWord = puzzle.placedWords[0];
  const highlighted = new Set(
    highlightedWord
      ? Array.from(highlightedWord.answer).map((_, index) =>
          highlightedWord.direction === "across"
            ? `${highlightedWord.row}:${highlightedWord.col + index}`
            : `${highlightedWord.row + index}:${highlightedWord.col}`,
        )
      : [],
  );

  return (
    <div
      className="preview-shell float-soft relative mx-auto min-w-0"
      aria-label="Örnek bir sevgili bulmacası"
    >
      <div className="absolute -left-8 top-10 h-28 w-28 rounded-full bg-accent-soft/35 blur-2xl" />
      <div className="absolute -right-7 bottom-8 h-36 w-36 rounded-full bg-gold/20 blur-2xl" />

      <div className="relative min-w-0 rounded-[2rem] border border-white/80 bg-surface/82 p-2 shadow-[0_35px_90px_rgba(80,35,42,0.18)] backdrop-blur sm:rounded-[2.5rem] sm:p-5 md:p-7">
        <div className="min-w-0 rounded-[1.6rem] border border-border bg-[#fffaf5] p-3 sm:rounded-[2rem] sm:p-5 md:p-7">
          <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6 sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent sm:text-sm sm:tracking-[0.28em]">
                Örnek bulmaca
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold leading-none tracking-[-0.04em] sm:text-4xl">
                Aşkın küçük haritası
              </h2>
            </div>
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-xl text-white sm:size-14 sm:text-2xl">
              ♥
            </div>
          </div>

          <div
            className="grid min-w-0 gap-[3px] sm:gap-1.5"
            style={{ gridTemplateColumns: `repeat(${cropped.cols}, minmax(0, 1fr))` }}
            aria-hidden="true"
          >
            {cropped.cells.map((cell) => {
              const key = `${cell.row}:${cell.col}`;

              if (cell.isBlocked) {
                return <div className="aspect-square" key={key} />;
              }

              return (
                <div
                  key={key}
                  className={`relative grid aspect-square min-w-0 place-items-center rounded-[0.3rem] text-[0.62rem] font-black uppercase shadow-[0_6px_14px_rgba(80,35,42,0.08)] sm:rounded-lg sm:text-base ${
                    highlighted.has(key)
                      ? "bg-accent text-white"
                      : "bg-surface-rose text-accent"
                  }`}
                >
                  {cell.number && startNumbers.has(cell.number) ? (
                    <span className="absolute left-0.5 top-0 text-[0.4rem] leading-none opacity-70 sm:left-1 sm:top-0.5 sm:text-[0.55rem]">
                      {cell.number}
                    </span>
                  ) : null}
                  {cell.letter}
                </div>
              );
            })}
          </div>

          <ol className="mt-5 grid gap-2 sm:mt-7">
            {puzzle.placedWords.slice(0, 3).map((word) => (
              <li
                className="rounded-2xl border border-border bg-white/70 px-3 py-2.5 text-sm leading-5 sm:px-4"
                key={word.id}
              >
                <span className="font-extrabold text-accent">
                  {word.number} {directionLabel[word.direction]}
                </span>
                <span className="mx-1.5 text-muted">·</span>
                <span className="font-bold text-foreground">{word.clue}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
