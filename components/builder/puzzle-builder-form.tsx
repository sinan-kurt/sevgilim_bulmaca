"use client";

import { FormEvent, useState } from "react";
import { generateCrosswordPuzzle } from "@/lib/crossword";
import {
  MIN_VALID_QUESTION_PAIRS,
  puzzleThemes,
  validatePuzzleDraftInput,
} from "@/lib/puzzle-validation";
import type {
  CreatePuzzleRequest,
  CreatePuzzleResponse,
  CrosswordPuzzle,
  PuzzleDraft,
  PuzzleQuestionInput,
  PuzzleTheme,
  PuzzleValidationErrors,
} from "@/types/crossword";
import { CrosswordGridPreview } from "../crossword-grid-preview";
import { PlayableCrossword } from "../playable-crossword";
import { QuestionAnswerRow } from "./question-answer-row";
import { ShareLinkCard } from "./share-link-card";
import { SuccessPreviewCard } from "./success-preview-card";

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
  const [draft, setDraft] = useState<PuzzleDraft | null>(null);
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [share, setShare] = useState<CreatePuzzleResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  function clearGeneratedState() {
    setDraft(null);
    setPuzzle(null);
    setShare(null);
    setSaveError("");
    setCopyStatus("");
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
    setCopyStatus("");

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

    const nextDraft: PuzzleDraft = {
      id: `draft-${Date.now()}`,
      title: title.trim(),
      finalMessage: finalMessage.trim(),
      theme,
      pairs: result.normalizedPairs,
      createdAt: new Date().toISOString(),
    };
    const nextPuzzle = generateCrosswordPuzzle(nextDraft.pairs);

    console.log("PuzzleDraft", nextDraft);
    console.log("CrosswordPuzzle", nextPuzzle);
    setDraft(nextDraft);
    setPuzzle(nextPuzzle);

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
      const responseBody = (await response.json()) as
        | CreatePuzzleResponse
        | { error?: string };

      if (!response.ok || !("id" in responseBody)) {
        throw new Error(
          "error" in responseBody && responseBody.error
            ? responseBody.error
            : "Bulmaca kaydedilemedi.",
        );
      }

      setShare(responseBody);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Bulmaca kaydedilirken beklenmeyen bir hata oluştu.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function copyShareLink() {
    if (!share) {
      return;
    }

    try {
      await navigator.clipboard.writeText(share.url);
      setCopyStatus("Link kopyalandı.");
    } catch {
      setCopyStatus("Link kopyalanamadı; elle seçip kopyalayabilirsin.");
    }
  }

  return (
    <div className="grid gap-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-white/80 bg-surface/86 p-5 shadow-[0_28px_80px_rgba(80,35,42,0.14)] backdrop-blur sm:p-7"
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_0.45fr]">
          <div>
            <label
              htmlFor="puzzle-title"
              className="text-sm font-extrabold text-foreground"
            >
              Bulmaca başlığı
            </label>
            <input
              id="puzzle-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                clearGeneratedState();
              }}
              placeholder="Bizim İlk Bulmacamız"
              className="mt-2 h-12 w-full rounded-2xl border border-border bg-white/75 px-4 text-base font-extrabold text-foreground outline-none transition placeholder:text-muted/55 focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
          </div>

          <div>
            <label
              htmlFor="puzzle-theme"
              className="text-sm font-extrabold text-foreground"
            >
              Tema
            </label>
            <select
              id="puzzle-theme"
              value={theme}
              onChange={(event) => {
                setTheme(event.target.value as PuzzleTheme);
                clearGeneratedState();
              }}
              className="mt-2 h-12 w-full rounded-2xl border border-border bg-white/75 px-4 text-base font-extrabold text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            >
              {puzzleThemes.map((themeOption) => (
                <option value={themeOption} key={themeOption}>
                  {themeOption}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="final-message"
            className="text-sm font-extrabold text-foreground"
          >
            Final mesajı
          </label>
          <textarea
            id="final-message"
            value={finalMessage}
            onChange={(event) => {
              setFinalMessage(event.target.value);
              clearGeneratedState();
            }}
            rows={4}
            placeholder="Bulmacayı çözdün... çünkü beni en iyi sen tanıyorsun ❤️"
            className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-border bg-white/75 px-4 py-3 text-base font-semibold text-foreground outline-none transition placeholder:text-muted/55 focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold leading-none tracking-[-0.04em]">
              Sorular
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              En az {MIN_VALID_QUESTION_PAIRS} geçerli ipucu ve cevap çifti
              gerekli.
            </p>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent/20 bg-accent/10 px-5 text-sm font-extrabold text-accent transition hover:-translate-y-0.5 hover:bg-accent hover:text-white"
          >
            Yeni soru ekle
          </button>
        </div>

        {errors.form ? (
          <div className="mt-5 rounded-2xl border border-accent/25 bg-accent/10 p-4 text-sm font-bold leading-6 text-accent">
            {errors.form}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4">
          {rows.map((row, index) => (
            <QuestionAnswerRow
              error={errors.pairs[row.id]}
              index={index}
              key={row.id}
              onChange={updateRow}
              onRemove={removeRow}
              row={row}
            />
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted">
            Gönderince yerel önizleme hemen görünecek, ardından paylaşılabilir
            link Supabase üzerinden oluşturulacak.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-8 py-4 text-base font-extrabold text-white shadow-[0_18px_45px_rgba(155,31,60,0.25)] transition hover:-translate-y-0.5 hover:bg-[#7f1830] focus:outline-none focus:ring-4 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Kaydediliyor..." : "Taslağı oluştur"}
          </button>
        </div>
      </form>

      {isSaving ? (
        <div className="rounded-[2rem] border border-border bg-white/72 p-5 text-sm font-extrabold text-muted shadow-[0_18px_45px_rgba(80,35,42,0.08)]">
          Paylaşım linki hazırlanıyor...
        </div>
      ) : null}
      {saveError ? (
        <div className="rounded-[2rem] border border-accent/25 bg-accent/10 p-5 text-sm font-bold leading-6 text-accent">
          {saveError}
        </div>
      ) : null}
      {share ? (
        <ShareLinkCard
          copyStatus={copyStatus}
          onCopy={copyShareLink}
          share={share}
        />
      ) : null}
      {draft ? <SuccessPreviewCard draft={draft} /> : null}
      {puzzle ? <CrosswordGridPreview puzzle={puzzle} /> : null}
      {draft && puzzle ? (
        <PlayableCrossword
          finalMessage={draft.finalMessage}
          key={draft.id}
          puzzle={puzzle}
        />
      ) : null}
    </div>
  );
}
