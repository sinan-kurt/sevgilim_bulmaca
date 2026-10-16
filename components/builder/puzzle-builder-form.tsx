"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CrosswordGridPreview } from "@/components/crossword-grid-preview";
import { generateCrosswordPuzzle } from "@/lib/crossword";
import { clueSuggestions } from "@/lib/landing-content";
import { rememberCreatedPuzzle } from "@/lib/share";
import {
  MAX_ANSWER_LENGTH,
  MIN_VALID_QUESTION_PAIRS,
  normalizePuzzleAnswer,
  puzzleThemeLabels,
  puzzleThemes,
  validatePuzzleDraftInput,
} from "@/lib/puzzle-validation";
import type {
  CreatePuzzleRequest,
  CreatePuzzleResponse,
  PuzzleDraft,
  PuzzleQuestionInput,
  PuzzleTheme,
  PuzzleValidationErrors,
} from "@/types/crossword";
import { QuestionAnswerRow } from "./question-answer-row";
import { ShareLinkCard } from "./share-link-card";

const DRAFT_STORAGE_KEY = "sevgili-bulmaca:taslak";

type StoredDraft = {
  title: string;
  finalMessage: string;
  theme: PuzzleTheme;
  rows: PuzzleQuestionInput[];
};

const initialRows: PuzzleQuestionInput[] = Array.from({ length: 5 }, (_, index) => ({
  id: `question-${index + 1}`,
  clue: "",
  answer: "",
}));

function createQuestionRow(): PuzzleQuestionInput {
  return {
    id: `question-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    clue: "",
    answer: "",
  };
}

export function PuzzleBuilderForm() {
  const [title, setTitle] = useState("");
  const [finalMessage, setFinalMessage] = useState("");
  const [theme, setTheme] = useState<PuzzleTheme>("romantic");
  const [rows, setRows] = useState<PuzzleQuestionInput[]>(initialRows);
  const [errors, setErrors] = useState<PuzzleValidationErrors>({ pairs: {} });
  const [share, setShare] = useState<CreatePuzzleResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const lastFocusedRowId = useRef<string | null>(null);

  // Keep the creator's work if the tab is closed or refreshed.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);

      if (saved) {
        const draft = JSON.parse(saved) as Partial<StoredDraft>;
        /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from storage */
        if (typeof draft.title === "string") setTitle(draft.title);
        if (typeof draft.finalMessage === "string") setFinalMessage(draft.finalMessage);
        if (draft.theme && puzzleThemes.includes(draft.theme)) setTheme(draft.theme);
        if (Array.isArray(draft.rows) && draft.rows.length > 0) setRows(draft.rows);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // Storage unavailable: start empty.
    }

    setHasLoadedDraft(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedDraft) {
      return;
    }

    try {
      const draft: StoredDraft = { title, finalMessage, theme, rows };
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage failures.
    }
  }, [hasLoadedDraft, title, finalMessage, theme, rows]);

  const completePairs = useMemo(
    () =>
      rows
        .map((row) => ({ clue: row.clue.trim(), answer: normalizePuzzleAnswer(row.answer) }))
        .filter((pair) => {
          const length = Array.from(pair.answer).length;
          return pair.clue && length >= 2 && length <= MAX_ANSWER_LENGTH;
        }),
    [rows],
  );
  const livePuzzle = useMemo(
    () => (completePairs.length > 0 ? generateCrosswordPuzzle(completePairs) : null),
    [completePairs],
  );
  const usedClues = new Set(rows.map((row) => row.clue.trim()));

  function applySuggestion(suggestion: string) {
    const focusedRow = rows.find(
      (row) => row.id === lastFocusedRowId.current && !row.clue.trim(),
    );
    const targetRow = focusedRow ?? rows.find((row) => !row.clue.trim());

    if (targetRow) {
      updateRow(targetRow.id, "clue", suggestion);
      document.getElementById(`${targetRow.id}-answer`)?.focus();
      return;
    }

    const newRow = { ...createQuestionRow(), clue: suggestion };
    setRows((currentRows) => [...currentRows, newRow]);
    clearGeneratedState();
    window.setTimeout(() => document.getElementById(`${newRow.id}-answer`)?.focus(), 0);
  }

  function clearGeneratedState() {
    setShare(null);
    setSaveError("");
  }

  function startNewPuzzle() {
    setTitle("");
    setFinalMessage("");
    setTheme("romantic");
    setRows(initialRows);
    setErrors({ pairs: {} });
    clearGeneratedState();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateRow(
    id: string,
    field: keyof Pick<PuzzleQuestionInput, "clue" | "answer">,
    value: string,
  ) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    );
    clearGeneratedState();
  }

  function addRow() {
    setRows((currentRows) => [...currentRows, createQuestionRow()]);
    clearGeneratedState();
  }

  function removeRow(id: string) {
    setRows((currentRows) => currentRows.filter((row) => row.id !== id));
    clearGeneratedState();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError("");
    setShare(null);

    const result = validatePuzzleDraftInput({
      title,
      finalMessage,
      theme,
      pairs: rows,
    });

    setErrors(result.errors);

    if (!result.isValid) {
      clearGeneratedState();
      return;
    }

    const nextPuzzle = generateCrosswordPuzzle(result.normalizedPairs);

    if (nextPuzzle.unplacedWords.length > 0) {
      setErrors({
        ...result.errors,
        form: `${nextPuzzle.unplacedWords
          .map((word) => word.answer)
          .join(", ")} ızgaraya sığmadı. Bu cevabı kısaltmayı ya da değiştirmeyi dene.`,
      });
      return;
    }

    const nextDraft: PuzzleDraft = {
      id: `draft-${Date.now()}`,
      title: title.trim(),
      finalMessage: finalMessage.trim(),
      theme,
      pairs: result.normalizedPairs,
      createdAt: new Date().toISOString(),
    };

    const payload: CreatePuzzleRequest = {
      draft: nextDraft,
      crossword: nextPuzzle,
    };

    setIsSaving(true);

    try {
      const response = await fetch("/api/puzzles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const responseBody = (await parsePuzzleResponse(response)) as
        | CreatePuzzleResponse
        | { error?: string };

      if (!response.ok || !("id" in responseBody)) {
        throw new Error(
          "error" in responseBody && responseBody.error
            ? responseBody.error
            : "Bulmaca kaydedilemedi.",
        );
      }

      rememberCreatedPuzzle({
        id: responseBody.id,
        url: responseBody.url,
        title: nextDraft.title,
      });
      setShare(responseBody);

      try {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore storage failures.
      }
    } catch (error) {
      console.error("[builder] Puzzle save failed", {
        message:
          error instanceof Error
            ? error.message
            : "Unexpected puzzle save failure",
      });
      setSaveError(
        error instanceof Error
          ? error.message
          : "Bulmaca kaydedilirken beklenmeyen bir hata oluştu.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (share) {
    return <ShareLinkCard onCreateNew={startNewPuzzle} share={share} title={title.trim()} />;
  }

  const inputClass =
    "mt-2 w-full rounded-2xl border border-border bg-white/75 px-4 text-base text-foreground outline-none transition placeholder:text-muted/55 focus:border-accent focus:ring-4 focus:ring-accent/10";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-[2rem] border border-white/80 bg-surface/86 p-5 shadow-[0_28px_80px_rgba(80,35,42,0.14)] backdrop-blur sm:p-7"
      >
        <div className="grid gap-5 sm:grid-cols-[1fr_0.5fr]">
          <div>
            <label htmlFor="puzzle-title" className="text-sm font-extrabold text-foreground">
              Bulmaca başlığı
            </label>
            <input
              id="puzzle-title"
              value={title}
              maxLength={60}
              onChange={(event) => {
                setTitle(event.target.value);
                clearGeneratedState();
              }}
              placeholder="Bizim İlk Bulmacamız"
              className={`${inputClass} h-12 font-extrabold`}
            />
          </div>

          <div>
            <label htmlFor="puzzle-theme" className="text-sm font-extrabold text-foreground">
              Tema
            </label>
            <select
              id="puzzle-theme"
              value={theme}
              onChange={(event) => {
                setTheme(event.target.value as PuzzleTheme);
                clearGeneratedState();
              }}
              className={`${inputClass} h-12 font-extrabold`}
            >
              {puzzleThemes.map((themeOption) => (
                <option value={themeOption} key={themeOption}>
                  {puzzleThemeLabels[themeOption]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="final-message" className="text-sm font-extrabold text-foreground">
            Final mesajı
          </label>
          <p className="mt-1 text-sm leading-6 text-muted">
            Bulmacayı bitirdiği anda ekranında bu mesaj açılacak.
          </p>
          <textarea
            id="final-message"
            value={finalMessage}
            maxLength={500}
            onChange={(event) => {
              setFinalMessage(event.target.value);
              clearGeneratedState();
            }}
            rows={3}
            placeholder="Bulmacayı çözdün... çünkü beni en iyi sen tanıyorsun ❤️"
            className={`${inputClass} min-h-24 resize-y py-3 font-semibold`}
          />
        </div>

        <div className="mt-8">
          <h2 className="font-display text-4xl font-bold leading-none tracking-[-0.04em]">
            Sorular
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            En az {MIN_VALID_QUESTION_PAIRS} soru. İpucu bir anı, cevap tek bir
            kelime olsun. Ne yazacağını bilemiyorsan bir fikre dokun:
          </p>
          <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {clueSuggestions
              .filter((suggestion) => !usedClues.has(suggestion))
              .slice(0, 8)
              .map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => applySuggestion(suggestion)}
                  className="shrink-0 rounded-full border border-accent/20 bg-white/70 px-3 py-1.5 text-xs font-extrabold text-accent transition hover:border-accent hover:bg-accent hover:text-white"
                >
                  + {suggestion}
                </button>
              ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {rows.map((row, index) => (
            <QuestionAnswerRow
              canRemove={rows.length > MIN_VALID_QUESTION_PAIRS}
              error={errors.pairs[row.id]}
              index={index}
              key={row.id}
              onChange={updateRow}
              onFocusClue={(id) => {
                lastFocusedRowId.current = id;
              }}
              onRemove={removeRow}
              row={row}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-dashed border-accent/35 bg-accent/5 px-5 text-sm font-extrabold text-accent transition hover:bg-accent/10"
        >
          + Yeni soru ekle
        </button>

        <div className="mt-6 lg:hidden">
          <CrosswordGridPreview
            minCount={MIN_VALID_QUESTION_PAIRS}
            puzzle={livePuzzle}
            validCount={completePairs.length}
          />
        </div>

        {errors.form ? (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-accent/25 bg-accent/10 p-4 text-sm font-bold leading-6 text-accent"
          >
            {errors.form}
          </div>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted">
            Sana özel, tahmin edilemeyen bir link oluşturulur. Linki gönderdiğin
            kişi bulmacayı açabilir.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-full bg-accent px-8 py-4 text-base font-extrabold text-white shadow-[0_18px_45px_rgba(155,31,60,0.25)] transition hover:-translate-y-0.5 hover:bg-[#7f1830] focus:outline-none focus:ring-4 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Hazırlanıyor..." : "Bulmacayı Oluştur"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 empty:hidden" aria-live="polite">
          {isSaving ? (
            <div className="rounded-[1.5rem] border border-border bg-white/72 p-5 text-sm font-extrabold text-muted">
              Paylaşım linki hazırlanıyor...
            </div>
          ) : null}
          {saveError ? (
            <div
              role="alert"
              className="rounded-[1.5rem] border border-accent/25 bg-accent/10 p-5 text-sm font-bold leading-6 text-accent"
            >
              {saveError}
            </div>
          ) : null}
        </div>
      </form>

      <aside className="hidden lg:sticky lg:top-6 lg:block">
        <CrosswordGridPreview
          minCount={MIN_VALID_QUESTION_PAIRS}
          puzzle={livePuzzle}
          validCount={completePairs.length}
        />
      </aside>
    </div>
  );
}

async function parsePuzzleResponse(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return {
      error:
        "Sunucudan geçerli bir yanıt alınamadı. Lütfen birazdan tekrar dene.",
    };
  }
}
