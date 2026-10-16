import { getCroppedGrid } from "@/lib/crossword";
import type { CrosswordPuzzle } from "@/types/crossword";

type CrosswordGridPreviewProps = {
  puzzle: CrosswordPuzzle | null;
  validCount: number;
  minCount: number;
};

/** Live layout preview for the builder; the creator sees the answers. */
export function CrosswordGridPreview({
  puzzle,
  validCount,
  minCount,
}: CrosswordGridPreviewProps) {
  const hasWords = Boolean(puzzle && puzzle.placedWords.length > 0);
  const cropped = puzzle ? getCroppedGrid(puzzle) : null;
  const remaining = Math.max(0, minCount - validCount);

  return (
    <section className="rounded-[2rem] border border-border bg-surface/88 p-5 shadow-[0_22px_60px_rgba(80,35,42,0.12)] backdrop-blur sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
            Canlı önizleme
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold leading-none tracking-[-0.04em]">
            Bulmacan böyle görünecek
          </h2>
        </div>
      </div>

      {hasWords && puzzle && cropped ? (
        <>
          <div
            className="mx-auto mt-5 grid w-full gap-[3px] rounded-3xl bg-accent/10 p-2 sm:p-3"
            style={{
              gridTemplateColumns: `repeat(${cropped.cols}, minmax(0, 1fr))`,
              maxWidth: `${Math.min(28, cropped.cols * 2.4)}rem`,
            }}
            aria-label="Oluşan bulmaca ızgarası"
          >
            {cropped.cells.map((cell) => (
              <div
                className={`relative grid aspect-square min-w-0 place-items-center rounded-[0.3rem] text-[0.6rem] font-black sm:text-xs ${
                  cell.isBlocked
                    ? ""
                    : "bg-white text-foreground shadow-[0_4px_10px_rgba(80,35,42,0.08)]"
                }`}
                key={`${cell.row}-${cell.col}`}
              >
                {cell.number ? (
                  <span className="absolute left-0.5 top-0 text-[0.4rem] font-extrabold leading-none text-accent sm:text-[0.5rem]">
                    {cell.number}
                  </span>
                ) : null}
                {cell.letter}
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm font-bold leading-6 text-muted">
            {puzzle.placedWords.length} kelime yerleşti.
            {remaining > 0
              ? ` Göndermek için ${remaining} soru daha ekle.`
              : " Gönderilmeye hazır."}
          </p>

          {puzzle.unplacedWords.length > 0 ? (
            <div className="mt-3 rounded-2xl border border-accent/25 bg-accent/10 p-4 text-sm leading-6 text-accent">
              <p className="font-extrabold">Bu kelimeler ızgaraya sığmadı:</p>
              <ul className="mt-1 font-bold">
                {puzzle.unplacedWords.map((word, index) => (
                  <li key={`${word.answer}-${index}`}>{word.answer}</li>
                ))}
              </ul>
              <p className="mt-2">
                Daha kısa bir cevap dene ya da diğer kelimelerle ortak harfi olan bir
                kelime seç.
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-5 grid place-items-center rounded-3xl border border-dashed border-border bg-white/40 px-6 py-12 text-center">
          <p className="text-4xl text-accent/40" aria-hidden="true">
            ♥
          </p>
          <p className="mt-3 max-w-xs text-sm font-bold leading-6 text-muted">
            İlk cevabı yazdığında kelimeler burada ızgaraya yerleşmeye başlar.
          </p>
        </div>
      )}
    </section>
  );
}
