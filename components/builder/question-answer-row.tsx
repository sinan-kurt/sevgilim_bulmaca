import { normalizePuzzleAnswer } from "@/lib/puzzle-validation";
import type { PuzzleQuestionInput, QuestionPairErrors } from "@/types/crossword";

type QuestionAnswerRowProps = {
  canRemove: boolean;
  error?: QuestionPairErrors;
  index: number;
  onChange: (
    id: string,
    field: keyof Pick<PuzzleQuestionInput, "clue" | "answer">,
    value: string,
  ) => void;
  onFocusClue: (id: string) => void;
  onRemove: (id: string) => void;
  row: PuzzleQuestionInput;
};

const cluePlaceholders = [
  "İlk tanıştığımız yer",
  "İlk buluşmamızda içtiğimiz şey",
  "Ona taktığım lakap",
  "Birlikte izlediğimiz ilk film",
  "Sadece ikimizin anladığı şaka",
];

const answerPlaceholders = ["Kadıköy", "Kahve", "Balım", "Titanik", "Patates"];

export function QuestionAnswerRow({
  canRemove,
  error,
  index,
  onChange,
  onFocusClue,
  onRemove,
  row,
}: QuestionAnswerRowProps) {
  const normalizedAnswer = normalizePuzzleAnswer(row.answer);
  const letterCount = Array.from(normalizedAnswer).length;
  const clueErrorId = `${row.id}-clue-error`;
  const answerErrorId = `${row.id}-answer-error`;
  const answerHintId = `${row.id}-answer-hint`;

  return (
    <div className="rounded-[1.5rem] border border-border bg-white/65 p-4 shadow-[0_12px_35px_rgba(80,35,42,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-accent">
          Soru {index + 1}
        </p>
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(row.id)}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-extrabold text-muted transition hover:border-accent/30 hover:text-accent"
          >
            Kaldır
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
        <div>
          <label htmlFor={`${row.id}-clue`} className="text-sm font-extrabold text-foreground">
            İpucu
          </label>
          <textarea
            id={`${row.id}-clue`}
            value={row.clue}
            onChange={(event) => onChange(row.id, "clue", event.target.value)}
            onFocus={() => onFocusClue(row.id)}
            rows={2}
            maxLength={140}
            aria-invalid={Boolean(error?.clue)}
            aria-describedby={error?.clue ? clueErrorId : undefined}
            placeholder={`Örn: ${cluePlaceholders[index % cluePlaceholders.length]}`}
            className="mt-2 min-h-20 w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-base font-semibold text-foreground outline-none transition placeholder:text-muted/55 focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
          {error?.clue ? (
            <p id={clueErrorId} className="mt-2 text-sm font-bold text-accent">
              {error.clue}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${row.id}-answer`} className="text-sm font-extrabold text-foreground">
            Cevap
          </label>
          <input
            id={`${row.id}-answer`}
            value={row.answer}
            onChange={(event) => onChange(row.id, "answer", event.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={40}
            aria-invalid={Boolean(error?.answer)}
            aria-describedby={error?.answer ? answerErrorId : answerHintId}
            placeholder={`Örn: ${answerPlaceholders[index % answerPlaceholders.length]}`}
            className="mt-2 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base font-extrabold text-foreground outline-none transition placeholder:text-muted/55 focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
          {error?.answer ? (
            <p id={answerErrorId} className="mt-2 text-sm font-bold text-accent">
              {error.answer}
            </p>
          ) : (
            <p id={answerHintId} className="mt-2 text-xs font-bold text-muted">
              {normalizedAnswer
                ? `Bulmacada: ${normalizedAnswer} · ${letterCount} harf`
                : "Tek kelime en iyisi. Boşluklar bulmacada silinir."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
