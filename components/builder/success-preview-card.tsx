import type { PuzzleDraft } from "@/types/crossword";

type SuccessPreviewCardProps = {
  draft: PuzzleDraft;
};

export function SuccessPreviewCard({ draft }: SuccessPreviewCardProps) {
  return (
    <aside className="rounded-[2rem] border border-accent/20 bg-accent/95 p-6 text-white shadow-[0_22px_60px_rgba(155,31,60,0.24)]">
      <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-white/70">
        Taslak hazır
      </p>
      <h2 className="mt-3 font-display text-4xl font-bold leading-none tracking-[-0.04em]">
        {draft.title || "İsimsiz Bulmaca"}
      </h2>
      <p className="mt-4 leading-7 text-white/82">
        {draft.finalMessage || "Final mesajı daha sonra eklenebilir."}
      </p>

      <div className="mt-6 grid gap-3 rounded-3xl bg-white/10 p-4">
        <div className="flex items-center justify-between gap-4 text-sm font-extrabold">
          <span>Tema</span>
          <span className="rounded-full bg-white/15 px-3 py-1 uppercase tracking-[0.18em]">
            {draft.theme}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm font-extrabold">
          <span>Geçerli soru</span>
          <span>{draft.pairs.length}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {draft.pairs.slice(0, 5).map((pair, index) => (
          <div
            className="rounded-2xl bg-white/12 p-3 text-sm leading-6"
            key={`${pair.answer}-${index}`}
          >
            <span className="font-extrabold">{index + 1}. </span>
            {pair.clue}
            <span className="ml-2 font-extrabold text-white">
              {pair.answer}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
