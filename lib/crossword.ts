import { normalizePuzzleAnswer } from "@/lib/puzzle-validation";
import type {
  CrosswordDirection,
  CrosswordPuzzle,
  PlacedWord,
  PuzzleQuestionPair,
} from "@/types/crossword";

export const CROSSWORD_GRID_SIZE = 15;

type Board = (string | null)[][];

type WordCandidate = PuzzleQuestionPair & {
  id: string;
  letters: string[];
  originalIndex: number;
};

type PlacementAttempt = {
  crossingCount: number;
  direction: CrosswordDirection;
  row: number;
  col: number;
};

function createEmptyBoard(size = CROSSWORD_GRID_SIZE): Board {
  return Array.from({ length: size }, () => Array<string | null>(size).fill(null));
}

function toWordCandidates(items: PuzzleQuestionPair[]): WordCandidate[] {
  return items
    .map((item, index) => {
      const answer = normalizePuzzleAnswer(item.answer);

      return {
        id: `word-${index + 1}`,
        clue: item.clue.trim(),
        answer,
        letters: Array.from(answer),
        originalIndex: index,
      };
    })
    .filter((item) => item.clue.length > 0 && item.letters.length > 0)
    .sort((a, b) => {
      const lengthDifference = b.letters.length - a.letters.length;
      return lengthDifference === 0 ? a.originalIndex - b.originalIndex : lengthDifference;
    });
}

function getWordCoordinate(
  word: Pick<PlacedWord, "row" | "col" | "direction">,
  letterIndex: number,
) {
  return word.direction === "across"
    ? { row: word.row, col: word.col + letterIndex }
    : { row: word.row + letterIndex, col: word.col };
}

function getPerpendicularDirection(direction: CrosswordDirection): CrosswordDirection {
  return direction === "across" ? "down" : "across";
}

function isInside(board: Board, row: number, col: number) {
  return row >= 0 && row < board.length && col >= 0 && col < board.length;
}

function hasLetter(board: Board, row: number, col: number) {
  return isInside(board, row, col) && board[row][col] !== null;
}

function canPlaceWord(
  board: Board,
  letters: string[],
  row: number,
  col: number,
  direction: CrosswordDirection,
): PlacementAttempt | null {
  const rowDelta = direction === "down" ? 1 : 0;
  const colDelta = direction === "across" ? 1 : 0;
  const endRow = row + rowDelta * (letters.length - 1);
  const endCol = col + colDelta * (letters.length - 1);

  if (!isInside(board, row, col) || !isInside(board, endRow, endCol)) {
    return null;
  }

  // Words may not touch end-to-end. This keeps fallback words from merging.
  if (
    hasLetter(board, row - rowDelta, col - colDelta) ||
    hasLetter(board, endRow + rowDelta, endCol + colDelta)
  ) {
    return null;
  }

  let crossingCount = 0;

  for (let index = 0; index < letters.length; index += 1) {
    const currentRow = row + rowDelta * index;
    const currentCol = col + colDelta * index;
    const existingLetter = board[currentRow][currentCol];

    if (existingLetter !== null) {
      if (existingLetter !== letters[index]) {
        return null;
      }

      crossingCount += 1;
      continue;
    }

    // Empty cells cannot sit beside a parallel neighbor, otherwise two words
    // would visually collide without sharing a valid crossing.
    if (direction === "across") {
      if (
        hasLetter(board, currentRow - 1, currentCol) ||
        hasLetter(board, currentRow + 1, currentCol)
      ) {
        return null;
      }
    } else if (
      hasLetter(board, currentRow, currentCol - 1) ||
      hasLetter(board, currentRow, currentCol + 1)
    ) {
      return null;
    }
  }

  return { crossingCount, direction, row, col };
}

function placeWordOnBoard(
  board: Board,
  candidate: WordCandidate,
  attempt: PlacementAttempt,
): PlacedWord {
  const rowDelta = attempt.direction === "down" ? 1 : 0;
  const colDelta = attempt.direction === "across" ? 1 : 0;

  for (let index = 0; index < candidate.letters.length; index += 1) {
    board[attempt.row + rowDelta * index][attempt.col + colDelta * index] =
      candidate.letters[index];
  }

  return {
    id: candidate.id,
    clue: candidate.clue,
    answer: candidate.answer,
    row: attempt.row,
    col: attempt.col,
    direction: attempt.direction,
    number: 0,
  };
}

function findCrossingPlacement(
  board: Board,
  candidate: WordCandidate,
  placedWords: PlacedWord[],
): PlacementAttempt | null {
  // Try each matching letter against each already placed word. The new word
  // always turns perpendicular to the crossed word, which creates classic
  // crossword intersections with a very small deterministic search.
  for (const placedWord of placedWords) {
    const placedLetters = Array.from(placedWord.answer);
    const direction = getPerpendicularDirection(placedWord.direction);

    for (
      let candidateLetterIndex = 0;
      candidateLetterIndex < candidate.letters.length;
      candidateLetterIndex += 1
    ) {
      for (
        let placedLetterIndex = 0;
        placedLetterIndex < placedLetters.length;
        placedLetterIndex += 1
      ) {
        if (candidate.letters[candidateLetterIndex] !== placedLetters[placedLetterIndex]) {
          continue;
        }

        const crossingCoordinate = getWordCoordinate(placedWord, placedLetterIndex);
        const row =
          direction === "down"
            ? crossingCoordinate.row - candidateLetterIndex
            : crossingCoordinate.row;
        const col =
          direction === "across"
            ? crossingCoordinate.col - candidateLetterIndex
            : crossingCoordinate.col;
        const attempt = canPlaceWord(board, candidate.letters, row, col, direction);

        if (attempt && attempt.crossingCount > 0) {
          return attempt;
        }
      }
    }
  }

  return null;
}

function findEmptyAreaPlacement(
  board: Board,
  candidate: WordCandidate,
): PlacementAttempt | null {
  // If a word cannot cross, place it in the first clean area found. Scanning
  // top-left to bottom-right keeps the fallback deterministic and readable.
  const directions: CrosswordDirection[] = ["across", "down"];

  for (const direction of directions) {
    for (let row = 0; row < board.length; row += 1) {
      for (let col = 0; col < board.length; col += 1) {
        const attempt = canPlaceWord(board, candidate.letters, row, col, direction);

        if (attempt && attempt.crossingCount === 0) {
          return attempt;
        }
      }
    }
  }

  return null;
}

function assignNumbers(placedWords: PlacedWord[]) {
  const startKeys = Array.from(
    new Set(placedWords.map((word) => `${word.row}:${word.col}`)),
  ).sort((a, b) => {
    const [rowA, colA] = a.split(":").map(Number);
    const [rowB, colB] = b.split(":").map(Number);
    return rowA === rowB ? colA - colB : rowA - rowB;
  });
  const numberByStart = new Map<string, number>();

  startKeys.forEach((key, index) => {
    numberByStart.set(key, index + 1);
  });

  return placedWords
    .map((word) => ({
      ...word,
      number: numberByStart.get(`${word.row}:${word.col}`) ?? 0,
    }))
    .sort((a, b) => {
      if (a.number !== b.number) {
        return a.number - b.number;
      }

      return a.direction.localeCompare(b.direction);
    });
}

function buildRenderableGrid(board: Board, placedWords: PlacedWord[]) {
  const numberByStart = new Map(
    placedWords.map((word) => [`${word.row}:${word.col}`, word.number]),
  );

  return board.map((row, rowIndex) =>
    row.map((letter, colIndex) => ({
      row: rowIndex,
      col: colIndex,
      letter,
      isBlocked: letter === null,
      number: numberByStart.get(`${rowIndex}:${colIndex}`),
    })),
  );
}

export function generateCrosswordPuzzle(
  items: PuzzleQuestionPair[],
): CrosswordPuzzle {
  const board = createEmptyBoard();
  const candidates = toWordCandidates(items);
  const placedWords: PlacedWord[] = [];
  const unplacedWords: PuzzleQuestionPair[] = [];
  const [firstCandidate, ...remainingCandidates] = candidates;

  if (!firstCandidate) {
    return {
      grid: buildRenderableGrid(board, []),
      placedWords: [],
      unplacedWords: [],
    };
  }

  // The longest word starts the puzzle horizontally in the middle row.
  const centerRow = Math.floor(CROSSWORD_GRID_SIZE / 2);
  const centerCol = Math.floor((CROSSWORD_GRID_SIZE - firstCandidate.letters.length) / 2);
  const firstAttempt = canPlaceWord(
    board,
    firstCandidate.letters,
    centerRow,
    centerCol,
    "across",
  );

  if (firstAttempt) {
    placedWords.push(placeWordOnBoard(board, firstCandidate, firstAttempt));
  } else {
    unplacedWords.push({ clue: firstCandidate.clue, answer: firstCandidate.answer });
  }

  for (const candidate of remainingCandidates) {
    const crossingAttempt = findCrossingPlacement(board, candidate, placedWords);
    const fallbackAttempt = crossingAttempt ?? findEmptyAreaPlacement(board, candidate);

    if (!fallbackAttempt) {
      unplacedWords.push({ clue: candidate.clue, answer: candidate.answer });
      continue;
    }

    placedWords.push(placeWordOnBoard(board, candidate, fallbackAttempt));
  }

  const numberedWords = assignNumbers(placedWords);

  return {
    grid: buildRenderableGrid(board, numberedWords),
    placedWords: numberedWords,
    unplacedWords,
  };
}
