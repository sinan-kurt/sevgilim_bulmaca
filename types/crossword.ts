export type CrosswordTileTone = "accent" | "gold" | "rose" | "ivory" | "empty";

export type CrosswordTile = {
  letter: string;
  tone: CrosswordTileTone;
};

export type MemoryPrompt = {
  title: string;
  description: string;
};

export type PuzzleTheme = "romantic" | "minimal" | "night";

export type PuzzleQuestionInput = {
  id: string;
  clue: string;
  answer: string;
};

export type PuzzleQuestionPair = {
  clue: string;
  answer: string;
};

export type PuzzleDraft = {
  id: string;
  title: string;
  finalMessage: string;
  theme: PuzzleTheme;
  pairs: PuzzleQuestionPair[];
  createdAt: string;
};

export type QuestionPairErrors = {
  clue?: string;
  answer?: string;
};

export type PuzzleValidationErrors = {
  form?: string;
  pairs: Record<string, QuestionPairErrors>;
};

export type CrosswordDirection = "across" | "down";

export type CrosswordCell = {
  row: number;
  col: number;
  letter: string | null;
  isBlocked: boolean;
  number?: number;
};

export type PlacedWord = {
  id: string;
  clue: string;
  answer: string;
  row: number;
  col: number;
  direction: CrosswordDirection;
  number: number;
};

export type CrosswordPuzzle = {
  grid: CrosswordCell[][];
  placedWords: PlacedWord[];
  unplacedWords: PuzzleQuestionPair[];
};

export type CreatePuzzleRequest = {
  draft: PuzzleDraft;
  crossword: CrosswordPuzzle;
};

export type CreatePuzzleResponse = {
  id: string;
  url: string;
};

export type StoredPuzzle = {
  id: string;
  title: string;
  theme: PuzzleTheme;
  finalMessage: string;
  questions: PuzzleQuestionPair[];
  crossword: CrosswordPuzzle;
  createdAt: string;
};
