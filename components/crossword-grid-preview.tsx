import type { CrosswordPuzzle } from "@/types/crossword";

type CrosswordGridPreviewProps = {
  puzzle: CrosswordPuzzle;
};

export function CrosswordGridPreview({ puzzle }: CrosswordGridPreviewProps) {
  return (
    <section className="rounded-[2rem] border border-border bg-surface/88 p-5 shadow-[0_22px_60px_rgba(80,35,42,0.12)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
            Bulmaca önizleme
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold leading-none tracking-[-0.04em]">
            İlk yerleşim
          </h2>
        </div>
        <p className="text-sm font-bold text-muted">
          {puzzle.placedWords.length} yerleşti
          {puzzle.unplacedWords.length > 0
            ? `, ${puzzle.unplacedWords.length} yerleşemedi`
            : ""}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div
          className="grid w-fit gap-1 rounded-3xl bg-accent/10 p-3"
          style={{
            gridTemplateColumns: `repeat(${puzzle.grid.length}, minmax(0, 2rem))`,
          }}
          aria-label="Oluşturulan bulmaca ızgarası"
        >
          {puzzle.grid.flat().map((cell) => (
            <div
              className={`relative grid size-8 place-items-center rounded-md text-sm font-black ${
                cell.isBlocked
                  ? "bg-accent/5"
                  : "bg-white text-foreground shadow-[0_8px_18px_rgba(80,35,42,0.08)]"
              }`}
              key={`${cell.row}-${cell.col}`}
            >
              {cell.number ? (
                <span className="absolute left-1 top-0.5 text-[0.55rem] font-extrabold leading-none text-accent">
                  {cell.number}
                </span>
              ) : null}
              {cell.letter}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <WordList title="Yerleşen kelimeler" words={puzzle.placedWords} />
        {puzzle.unplacedWords.length > 0 ? (
          <div className="rounded-3xl border border-accent/20 bg-accent/10 p-4">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-accent">
              Yerleşemeyenler
            </h3>
            <ul className="mt-3 grid gap-2 text-sm font-bold text-muted">
              {puzzle.unplacedWords.map((word, index) => (
                <li key={`${word.answer}-${index}`}>
                  {word.answer} - {word.clue}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function WordList({
  title,
  words,
}: {
  title: string;
  words: CrosswordPuzzle["placedWords"];
}) {
  return (
    <div className="rounded-3xl border border-border bg-white/60 p-4">
      <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-muted">
        {title}
      </h3>
      <ul className="mt-3 grid gap-2 text-sm text-muted">
        {words.map((word) => (
          <li key={word.id}>
            <span className="font-extrabold text-foreground">{word.number}. </span>
            <span className="font-bold">{word.answer}</span>
            <span className="text-muted/75"> ({word.direction})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
