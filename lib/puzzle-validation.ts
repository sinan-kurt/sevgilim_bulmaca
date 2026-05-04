import type {
  PuzzleQuestionInput,
  PuzzleQuestionPair,
  PuzzleTheme,
  PuzzleValidationErrors,
} from "@/types/crossword";

export const MIN_VALID_QUESTION_PAIRS = 5;

export const puzzleThemes: PuzzleTheme[] = ["romantic", "minimal", "night"];

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

export function normalizePuzzleAnswer(answer: string) {
  return answer.trim().replace(/\s+/gu, "").toLocaleUpperCase("tr-TR");
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

    if (!clue) {
      pairErrors.clue = "İpucu boş olamaz.";
    }

    if (!answer) {
      pairErrors.answer = "Cevap boş olamaz.";
    }

    if (Object.keys(pairErrors).length > 0) {
      errors.pairs[pair.id] = pairErrors;
      continue;
    }

    validPairCount += 1;
    normalizedPairs.push({ clue, answer });
  }

  if (validPairCount < MIN_VALID_QUESTION_PAIRS) {
    errors.form = `En az ${MIN_VALID_QUESTION_PAIRS} geçerli soru-cevap çifti eklemelisin. Şu an ${validPairCount} geçerli çift var.`;
  }

  return {
    isValid: !errors.form && Object.keys(errors.pairs).length === 0,
    errors,
    normalizedPairs,
    validPairCount,
  };
}
