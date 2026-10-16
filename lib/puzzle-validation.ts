import { CROSSWORD_GRID_SIZE } from "@/lib/crossword-constants";
import type {
  PuzzleQuestionInput,
  PuzzleQuestionPair,
  PuzzleTheme,
  PuzzleValidationErrors,
} from "@/types/crossword";

export const MIN_VALID_QUESTION_PAIRS = 5;
export const MAX_ANSWER_LENGTH = CROSSWORD_GRID_SIZE;

export const puzzleThemes: PuzzleTheme[] = ["romantic", "minimal", "night"];

export const puzzleThemeLabels: Record<PuzzleTheme, string> = {
  romantic: "Romantik",
  minimal: "Sade",
  night: "Gece",
};

export type PuzzleDraftInput = {
  title: string;
  finalMessage: string;
  theme: PuzzleTheme;
  pairs: PuzzleQuestionInput[];
};

export type PuzzleValidationResult = {
  isValid: boolean;
  errors: PuzzleValidationErrors;
  normalizedPairs: PuzzleQuestionPair[];
  validPairCount: number;
};

/**
 * Turns a free-form answer into crossword letters: spaces and punctuation are
 * dropped, Turkish casing rules are respected (i → İ, ı → I).
 */
export function normalizePuzzleAnswer(answer: string) {
  return answer
    .trim()
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLocaleUpperCase("tr-TR");
}

export function validatePuzzleDraftInput(
  input: PuzzleDraftInput,
): PuzzleValidationResult {
  const errors: PuzzleValidationErrors = { pairs: {} };
  const normalizedPairs: PuzzleQuestionPair[] = [];
  let validPairCount = 0;

  for (const pair of input.pairs) {
    const clue = pair.clue.trim();
    const answer = normalizePuzzleAnswer(pair.answer);
    const pairErrors: PuzzleValidationErrors["pairs"][string] = {};

    // Completely empty rows are ignored instead of blocking the form.
    if (!clue && !answer) {
      continue;
    }

    if (!clue) {
      pairErrors.clue = "Bu cevap için bir ipucu yaz.";
    }

    if (!answer) {
      pairErrors.answer = "Bu ipucunun cevabını yaz.";
    } else if (Array.from(answer).length < 2) {
      pairErrors.answer = "Cevap en az 2 harf olmalı.";
    } else if (Array.from(answer).length > MAX_ANSWER_LENGTH) {
      pairErrors.answer = `Cevap en fazla ${MAX_ANSWER_LENGTH} harf olabilir.`;
    }

    if (Object.keys(pairErrors).length > 0) {
      errors.pairs[pair.id] = pairErrors;
      continue;
    }

    validPairCount += 1;
    normalizedPairs.push({ clue, answer });
  }

  if (validPairCount < MIN_VALID_QUESTION_PAIRS) {
    const missing = MIN_VALID_QUESTION_PAIRS - validPairCount;
    errors.form = `Bulmaca için en az ${MIN_VALID_QUESTION_PAIRS} soru gerekiyor. ${missing} soru daha eklemen yeterli.`;
  }

  return {
    isValid: !errors.form && Object.keys(errors.pairs).length === 0,
    errors,
    normalizedPairs,
    validPairCount,
  };
}
