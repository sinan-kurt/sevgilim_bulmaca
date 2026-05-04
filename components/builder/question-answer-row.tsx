import { normalizePuzzleAnswer } from "@/lib/puzzle-validation";
import type {
  PuzzleQuestionInput,
  QuestionPairErrors,
} from "@/types/crossword";

type QuestionAnswerRowProps = {
  error?: QuestionPairErrors;
  index: number;
  onChange: (
    id: string,
    field: keyof Pick<PuzzleQuestionInput, "clue" | "answer">,
    value: string,
  ) => void;
  onRemove: (id: string) => void;
  row: PuzzleQuestionInput;
};

export function QuestionAnswerRow({
  error,
  index,
  onChange,
  onRemove,
  row,
}: QuestionAnswerRowProps) {
  const normalizedAnswer = normalizePuzzleAnswer(row.answer);
  const clueErrorId = `${row.id}-clue-error`;
  const answerErrorId = `${row.id}-answer-error`;

  return (
    <div className="rounded-[1.5rem] border border-border bg-white/65 p-4 shadow-[0_12px_35px_rgba(80,35,42,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-accent">
          Soru {index + 1}
        </p>
        <button
          type="button"
          onClick={() => onRemove(row.id)}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-extrabold text-muted transition hover:border-accent/30 hover:text-accent"
        >
          Kaldır
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
        <div>
          <label
            htmlFor={`${row.id}-clue`}
            className="text-sm font-extrabold text-foreground"
          >
            İpucu
          </label>
          <textarea
            id={`${row.id}-clue`}
            value={row.clue}
            onChange={(event) => onChange(row.id, "clue", event.target.value)}
            rows={3}
            aria-invalid={Boolean(error?.clue)}
            aria-describedby={error?.clue ? clueErrorId : undefined}
            placeholder="İlk tanıştığımız yer"
            className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-base font-semibold text-foreground outline-none transition placeholder:text-muted/55 focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
          {error?.clue ? (
            <p id={clueErrorId} className="mt-2 text-sm font-bold text-accent">
              {error.clue}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${row.id}-answer`}
            className="text-sm font-extrabold text-foreground"
          >
            Cevap
          </label>
          <input
            id={`${row.id}-answer`}
            value={row.answer}
            onChange={(event) => onChange(row.id, "answer", event.target.value)}
            aria-invalid={Boolean(error?.answer)}
            aria-describedby={error?.answer ? answerErrorId : undefined}
            placeholder="Kadıköy"
            className="mt-2 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base font-extrabold text-foreground outline-none transition placeholder:text-muted/55 focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
          {error?.answer ? (
            <p id={answerErrorId} className="mt-2 text-sm font-bold text-accent">
              {error.answer}
            </p>
          ) : (
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-muted">
              Normal: {normalizedAnswer || "Henüz yok"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
