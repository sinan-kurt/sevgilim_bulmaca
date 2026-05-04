"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  buildSolutionMap,
  evaluateCrossword,
  findWordForCellByDirection,
  getCellKey,
  getFirstEmptyCellKeyInWord,
  getNextCellKeyInWord,
  getPlacedWordCells,
  getWordsContainingCell,
  isPlayableCell,
  normalizeTypedLetter,
  type CrosswordCellStatus,
  type CrosswordCheckResult,
} from "@/lib/crossword-play";
import type {
  CrosswordCell,
  CrosswordDirection,
  CrosswordPuzzle,
  PlacedWord,
} from "@/types/crossword";

type PlayableCrosswordProps = {
  finalMessage: string;
  puzzle: CrosswordPuzzle;
};

type ArrowKey = "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ArrowUp";

export function PlayableCrossword({
  finalMessage,
  puzzle,
}: PlayableCrosswordProps) {
  const firstWord = puzzle.placedWords[0] ?? null;
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, CrosswordCellStatus>>(
    {},
  );
  const [progress, setProgress] = useState<CrosswordCheckResult | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [activeWordId, setActiveWordId] = useState(firstWord?.id ?? "");
  const [activeDirection, setActiveDirection] = useState<CrosswordDirection>(
    firstWord?.direction ?? "across",
  );
  const [focusedCellKey, setFocusedCellKey] = useState<string | null>(null);
  const totalLetters = Object.keys(buildSolutionMap(puzzle)).length;
  const activeWord =
    puzzle.placedWords.find((word) => word.id === activeWordId) ??
    firstWord;
  const activeWordCellKeys = new Set(
    activeWord ? getPlacedWordCells(activeWord).map((cell) => cell.key) : [],
  );

  function focusCell(key: string | null) {
    if (!key) {
      return;
    }

    setFocusedCellKey(key);
    inputRefs.current[key]?.focus();
  }

  function activateWord(word: PlacedWord) {
    setActiveWordId(word.id);
    setActiveDirection(word.direction);
  }

  function activateWordAndFocus(word: PlacedWord, key: string | null) {
    activateWord(word);
    focusCell(key);
  }

  function resolveWordForCell(cell: CrosswordCell) {
    const containingWords = getWordsContainingCell(puzzle, cell.row, cell.col);

    if (containingWords.length === 0) {
      return null;
    }

    if (
      activeWord &&
      containingWords.some((word) => word.id === activeWord.id)
    ) {
      return activeWord;
    }

    return (
      containingWords.find((word) => word.direction === activeDirection) ??
      containingWords[0]
    );
  }

  function clearStatusForCell(key: string) {
    setStatuses((currentStatuses) => {
      const nextStatuses = { ...currentStatuses };
      delete nextStatuses[key];
      return nextStatuses;
    });
    setProgress(null);
    setIsSolved(false);
  }

  function updateCell(cell: CrosswordCell, rawValue: string) {
    const key = getCellKey(cell.row, cell.col);
    const nextValue = normalizeTypedLetter(rawValue);
    const targetWord = resolveWordForCell(cell);

    if (targetWord) {
      activateWord(targetWord);
    }

    setValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }));
    clearStatusForCell(key);

    if (nextValue && targetWord) {
      focusCell(getNextCellKeyInWord(targetWord, cell.row, cell.col, 1));
    }
  }

  function clearCell(cell: CrosswordCell) {
    const key = getCellKey(cell.row, cell.col);

    setValues((currentValues) => ({
      ...currentValues,
      [key]: "",
    }));
    clearStatusForCell(key);
  }

  function handleCellFocus(cell: CrosswordCell) {
    const key = getCellKey(cell.row, cell.col);
    const targetWord = resolveWordForCell(cell);

    setFocusedCellKey(key);

    if (targetWord) {
      activateWord(targetWord);
    }
  }

  function handleCellClick(cell: CrosswordCell) {
    const key = getCellKey(cell.row, cell.col);
    const targetWord = resolveWordForCell(cell);

    if (targetWord) {
      activateWordAndFocus(targetWord, key);
    }
  }

  function handleKeyDown(
    cell: CrosswordCell,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    const key = getCellKey(cell.row, cell.col);
    const targetWord = resolveWordForCell(cell);

    if (event.key === "Backspace") {
      event.preventDefault();

      if (values[key]) {
        clearCell(cell);
        return;
      }

      if (targetWord) {
        activateWord(targetWord);
        focusCell(getNextCellKeyInWord(targetWord, cell.row, cell.col, -1));
      }

      return;
    }

    if (isArrowKey(event.key)) {
      event.preventDefault();
      const direction = getDirectionForArrowKey(event.key);
      const directionalWord = findWordForCellByDirection(
        puzzle,
        cell.row,
        cell.col,
        direction,
      );

      if (!directionalWord) {
        return;
      }

      activateWord(directionalWord);
      focusCell(
        getNextCellKeyInWord(
          directionalWord,
          cell.row,
          cell.col,
          getStepForArrowKey(event.key),
        ),
      );
    }
  }

  function handleClueClick(word: PlacedWord) {
    activateWordAndFocus(word, getFirstEmptyCellKeyInWord(word, values));
  }

  function handleCheck() {
    const result = evaluateCrossword(puzzle, values);
    setStatuses(result.statuses);
    setProgress(result);
    setIsSolved(
      result.totalLetters > 0 && result.correctLetters === result.totalLetters,
    );
  }

  const acrossWords = puzzle.placedWords.filter(
    (word) => word.direction === "across",
  );
  const downWords = puzzle.placedWords.filter((word) => word.direction === "down");

  return (
    <section className="rounded-[2rem] border border-border bg-surface/90 p-5 shadow-[0_22px_60px_rgba(80,35,42,0.12)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
            Oynanabilir bulmaca
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold leading-none tracking-[-0.04em]">
            Şimdi çözme zamanı
          </h2>
        </div>
        <p className="rounded-full bg-accent/10 px-4 py-2 text-sm font-extrabold text-accent">
          {totalLetters} harf
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_0.78fr]">
        <div className="min-w-0">
          <div
            className="mx-auto grid w-full max-w-[40rem] gap-0.5 rounded-3xl bg-accent/10 p-2 sm:gap-1 sm:p-3"
            style={{
              gridTemplateColumns: `repeat(${puzzle.grid.length}, minmax(0, 1fr))`,
            }}
            aria-label="Çözülebilir bulmaca ızgarası"
          >
            {puzzle.grid.flat().map((cell) => {
              const key = getCellKey(cell.row, cell.col);

              return (
                <PlayableCell
                  cell={cell}
                  inputRef={(node) => {
                    inputRefs.current[key] = node;
                  }}
                  isActive={activeWordCellKeys.has(key)}
                  isFocused={focusedCellKey === key}
                  key={key}
                  onChange={updateCell}
                  onClick={handleCellClick}
                  onFocus={handleCellFocus}
                  onKeyDown={handleKeyDown}
                  status={statuses[key]}
                  value={values[key] ?? ""}
                />
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-h-6 text-sm font-extrabold text-muted">
              {progress
                ? `${progress.correctLetters} / ${progress.totalLetters} harf doğru`
                : "Hazır olduğunda cevabını kontrol et."}
            </p>
            <button
              type="button"
              onClick={handleCheck}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-extrabold text-white shadow-[0_16px_38px_rgba(155,31,60,0.22)] transition hover:-translate-y-0.5 hover:bg-[#7f1830] focus:outline-none focus:ring-4 focus:ring-accent/25"
            >
              Kontrol Et
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <ClueList
            activeWordId={activeWord?.id ?? ""}
            onSelectWord={handleClueClick}
            title="Yatay"
            words={acrossWords}
          />
          <ClueList
            activeWordId={activeWord?.id ?? ""}
            onSelectWord={handleClueClick}
            title="Dikey"
            words={downWords}
          />
        </div>
      </div>

      {isSolved ? (
        <div className="mt-6 rounded-[2rem] border border-accent/20 bg-accent p-6 text-white shadow-[0_22px_60px_rgba(155,31,60,0.24)]">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-white/70">
            Harika
          </p>
          <h3 className="mt-2 font-display text-4xl font-bold leading-none tracking-[-0.04em]">
            Bulmacayı çözdün ❤️
          </h3>
          <p className="mt-4 leading-7 text-white/85">
            {finalMessage ||
              "Bulmacayı çözdün... çünkü beni en iyi sen tanıyorsun."}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function PlayableCell({
  cell,
  inputRef,
  isActive,
  isFocused,
  onChange,
  onClick,
  onFocus,
  onKeyDown,
  status,
  value,
}: {
  cell: CrosswordCell;
  inputRef: (node: HTMLInputElement | null) => void;
  isActive: boolean;
  isFocused: boolean;
  onChange: (cell: CrosswordCell, rawValue: string) => void;
  onClick: (cell: CrosswordCell) => void;
  onFocus: (cell: CrosswordCell) => void;
  onKeyDown: (
    cell: CrosswordCell,
    event: KeyboardEvent<HTMLInputElement>,
  ) => void;
  status?: CrosswordCellStatus;
  value: string;
}) {
  if (!isPlayableCell(cell)) {
    return (
      <div
        aria-hidden="true"
        className="aspect-square rounded-[0.32rem] bg-foreground/75"
      />
    );
  }

  const statusClass =
    status === "correct"
      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
      : status === "incorrect"
        ? "border-accent bg-accent/10 text-accent"
        : isFocused
          ? "border-accent bg-white text-foreground ring-2 ring-accent/25"
          : isActive
            ? "border-accent/35 bg-accent/10 text-foreground"
            : "border-border bg-white text-foreground";

  return (
    <div className="relative aspect-square min-w-0">
      {cell.number ? (
        <span className="pointer-events-none absolute left-0.5 top-0.5 z-10 text-[0.48rem] font-extrabold leading-none text-accent sm:left-1 sm:top-1 sm:text-[0.62rem]">
          {cell.number}
        </span>
      ) : null}
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(cell, event.target.value)}
        onClick={() => onClick(cell)}
        onFocus={() => onFocus(cell)}
        onKeyDown={(event) => onKeyDown(cell, event)}
        maxLength={1}
        autoComplete="off"
        inputMode="text"
        aria-label={`Satır ${cell.row + 1}, sütun ${cell.col + 1}`}
        className={`size-full rounded-[0.32rem] border text-center text-[0.62rem] font-black uppercase outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm ${statusClass}`}
      />
    </div>
  );
}

function ClueList({
  activeWordId,
  onSelectWord,
  title,
  words,
}: {
  activeWordId: string;
  onSelectWord: (word: PlacedWord) => void;
  title: string;
  words: CrosswordPuzzle["placedWords"];
}) {
  return (
    <div className="rounded-3xl border border-border bg-white/62 p-4">
      <h3 className="font-display text-3xl font-bold leading-none tracking-[-0.04em]">
        {title}
      </h3>
      <ul className="mt-4 grid gap-3">
        {words.map((word) => {
          const isActive = activeWordId === word.id;

          return (
            <li key={word.id}>
              <button
                type="button"
                onClick={() => onSelectWord(word)}
                className={`w-full rounded-2xl px-3 py-2 text-left text-sm leading-6 transition ${
                  isActive
                    ? "bg-accent/10 font-extrabold text-accent"
                    : "text-muted hover:bg-accent/5 hover:text-accent"
                }`}
              >
                <span className="font-extrabold text-foreground">
                  {word.number}.{" "}
                </span>
                {word.clue}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function isArrowKey(key: string): key is ArrowKey {
  return (
    key === "ArrowDown" ||
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "ArrowUp"
  );
}

function getDirectionForArrowKey(key: ArrowKey): CrosswordDirection {
  return key === "ArrowLeft" || key === "ArrowRight" ? "across" : "down";
}

function getStepForArrowKey(key: ArrowKey): 1 | -1 {
  return key === "ArrowLeft" || key === "ArrowUp" ? -1 : 1;
}
