import type {
  CrosswordCell,
  CrosswordDirection,
  CrosswordPuzzle,
  PlacedWord,
} from "@/types/crossword";

export type CrosswordCellStatus = "correct" | "incorrect";

export type CrosswordCheckResult = {
  correctLetters: number;
  totalLetters: number;
  statuses: Record<string, CrosswordCellStatus>;
};

export function getCellKey(row: number, col: number) {
  return `${row}:${col}`;
}

export function normalizeTypedLetter(value: string) {
  const characters = Array.from(value.replace(/\s+/gu, ""));
  const latestCharacter = characters[characters.length - 1];

  return latestCharacter ? latestCharacter.toLocaleUpperCase("tr-TR") : "";
}

export function buildSolutionMap(puzzle: CrosswordPuzzle) {
  const solution: Record<string, string> = {};

  for (const row of puzzle.grid) {
    for (const cell of row) {
      if (!cell.isBlocked && cell.letter) {
        solution[getCellKey(cell.row, cell.col)] = cell.letter;
      }
    }
  }

  return solution;
}

export function evaluateCrossword(
  puzzle: CrosswordPuzzle,
  values: Record<string, string>,
): CrosswordCheckResult {
  const solution = buildSolutionMap(puzzle);
  const statuses: Record<string, CrosswordCellStatus> = {};
  let correctLetters = 0;

  for (const [key, expectedLetter] of Object.entries(solution)) {
    const typedLetter = normalizeTypedLetter(values[key] ?? "");
    const isCorrect = typedLetter === expectedLetter;

    statuses[key] = isCorrect ? "correct" : "incorrect";

    if (isCorrect) {
      correctLetters += 1;
    }
  }

  return {
    correctLetters,
    totalLetters: Object.keys(solution).length,
    statuses,
  };
}

export function getSequentialCellKey(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
  step: 1 | -1,
) {
  const playableCells = puzzle.grid.flat().filter((cell) => !cell.isBlocked);
  const currentIndex = playableCells.findIndex(
    (cell) => cell.row === row && cell.col === col,
  );
  const nextCell = playableCells[currentIndex + step];

  return nextCell ? getCellKey(nextCell.row, nextCell.col) : null;
}

export function getDirectionalCellKey(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
  rowDelta: number,
  colDelta: number,
) {
  let nextRow = row + rowDelta;
  let nextCol = col + colDelta;

  while (isInsideGrid(puzzle, nextRow, nextCol)) {
    const cell = puzzle.grid[nextRow][nextCol];

    if (!cell.isBlocked) {
      return getCellKey(cell.row, cell.col);
    }

    nextRow += rowDelta;
    nextCol += colDelta;
  }

  return null;
}

function isInsideGrid(puzzle: CrosswordPuzzle, row: number, col: number) {
  return row >= 0 && row < puzzle.grid.length && col >= 0 && col < puzzle.grid.length;
}

export function isPlayableCell(cell: CrosswordCell) {
  return !cell.isBlocked && Boolean(cell.letter);
}

export function getPlacedWordCells(word: PlacedWord) {
  return Array.from(word.answer).map((_, index) => {
    const row = word.direction === "down" ? word.row + index : word.row;
    const col = word.direction === "across" ? word.col + index : word.col;

    return {
      row,
      col,
      key: getCellKey(row, col),
    };
  });
}

export function wordContainsCell(word: PlacedWord, row: number, col: number) {
  return getPlacedWordCells(word).some((cell) => cell.row === row && cell.col === col);
}

export function getWordsContainingCell(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
) {
  return puzzle.placedWords.filter((word) => wordContainsCell(word, row, col));
}

export function findWordForCellByDirection(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
  direction: CrosswordDirection,
) {
  return getWordsContainingCell(puzzle, row, col).find(
    (word) => word.direction === direction,
  );
}

export function getFirstEmptyCellKeyInWord(
  word: PlacedWord,
  values: Record<string, string>,
) {
  const cells = getPlacedWordCells(word);
  const firstEmptyCell = cells.find((cell) => !values[cell.key]);

  return firstEmptyCell?.key ?? cells[0]?.key ?? null;
}

export function getNextCellKeyInWord(
  word: PlacedWord,
  row: number,
  col: number,
  step: 1 | -1,
) {
  const cells = getPlacedWordCells(word);
  const currentIndex = cells.findIndex((cell) => cell.row === row && cell.col === col);
  const nextCell = cells[currentIndex + step];

  return nextCell?.key ?? null;
}
