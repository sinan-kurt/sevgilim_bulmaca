"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { getCroppedGrid } from "@/lib/crossword";
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
  lettersMatch,
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
  /** Small label above the title. */
  eyebrow?: string;
  title?: string;
  /** Shows a "create your own" button in the celebration. */
  showCreateCta?: boolean;
  /** When set, the solver's letters survive a page reload. */
  storageKey?: string;
};

type ArrowKey = "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ArrowUp";

const DEFAULT_FINAL_MESSAGE =
  "Bulmacayı çözdün... çünkü beni en iyi sen tanıyorsun.";

const directionLabel: Record<CrosswordDirection, string> = {
  across: "Yatay",
  down: "Dikey",
};

export function PlayableCrossword({
  finalMessage,
  puzzle,
  eyebrow = "Sana özel",
  title = "Şimdi çözme zamanı",
  showCreateCta = false,
  storageKey,
}: PlayableCrosswordProps) {
  const firstWord = puzzle.placedWords[0] ?? null;
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, CrosswordCellStatus>>(
    {},
  );
  const [revealed, setRevealed] = useState<Record<string, true>>({});
  const [progress, setProgress] = useState<CrosswordCheckResult | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeWordId, setActiveWordId] = useState(firstWord?.id ?? "");
  const [activeDirection, setActiveDirection] = useState<CrosswordDirection>(
    firstWord?.direction ?? "across",
  );
  const [focusedCellKey, setFocusedCellKey] = useState<string | null>(null);
  const solution = buildSolutionMap(puzzle);
  const totalLetters = Object.keys(solution).length;
  const filledLetters = Object.keys(solution).filter((key) => values[key]).length;
  const cropped = getCroppedGrid(puzzle);
  const activeWord =
    puzzle.placedWords.find((word) => word.id === activeWordId) ?? firstWord;
  const activeWordCellKeys = new Set(
    activeWord ? getPlacedWordCells(activeWord).map((cell) => cell.key) : [],
  );
  const orderedWords = [...puzzle.placedWords].sort((a, b) =>
    a.direction === b.direction
      ? a.number - b.number
      : a.direction === "across"
        ? -1
        : 1,
  );

  // Restore letters the solver typed on an earlier visit.
  useEffect(() => {
    if (!storageKey) {
      return;
    }

    try {
      const saved = window.localStorage.getItem(storageKey);

      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, string>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
        setValues(parsed);
        const result = evaluateCrossword(puzzle, parsed);

        if (result.totalLetters > 0 && result.correctLetters === result.totalLetters) {
          setIsSolved(true);
          setStatuses(result.statuses);
        }
      }
    } catch {
      // Storage can be unavailable (private mode); playing still works.
    }
  }, [puzzle, storageKey]);

  function persist(nextValues: Record<string, string>) {
    if (!storageKey) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextValues));
    } catch {
      // Ignore storage failures.
    }
  }

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

    if (activeWord && containingWords.some((word) => word.id === activeWord.id)) {
      return activeWord;
    }

    return (
      containingWords.find((word) => word.direction === activeDirection) ??
      containingWords[0]
    );
  }

  function commitValues(nextValues: Record<string, string>, changedKey: string) {
    setValues(nextValues);
    persist(nextValues);
    setStatuses((current) => {
      const next = { ...current };
      delete next[changedKey];
      return next;
    });
    setProgress(null);

    const allCorrect = Object.entries(solution).every(([key, letter]) =>
      lettersMatch(nextValues[key] ?? "", letter),
    );

    if (allCorrect && totalLetters > 0) {
      const result = evaluateCrossword(puzzle, nextValues);
      setStatuses(result.statuses);
      setProgress(result);

      if (!isSolved) {
        setIsSolved(true);
        setShowCelebration(true);
      }
    } else {
      setIsSolved(false);
    }
  }

  function updateCell(cell: CrosswordCell, rawValue: string) {
    const key = getCellKey(cell.row, cell.col);
    const nextValue = normalizeTypedLetter(rawValue);
    const targetWord = resolveWordForCell(cell);

    if (targetWord) {
      activateWord(targetWord);
    }

    commitValues({ ...values, [key]: nextValue }, key);

    if (nextValue && targetWord) {
      focusCell(getNextCellKeyInWord(targetWord, cell.row, cell.col, 1));
    }
  }

  function clearCell(cell: CrosswordCell) {
    const key = getCellKey(cell.row, cell.col);
    commitValues({ ...values, [key]: "" }, key);
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
    const containingWords = getWordsContainingCell(puzzle, cell.row, cell.col);

    // Tapping the focused cell again flips between across and down.
    if (focusedCellKey === key && containingWords.length > 1 && activeWord) {
      const other = containingWords.find((word) => word.id !== activeWord.id);

      if (other) {
        activateWordAndFocus(other, key);
        return;
      }
    }

    const targetWord = resolveWordForCell(cell);

    if (targetWord) {
      activateWordAndFocus(targetWord, key);
    }
  }

  function handleKeyDown(cell: CrosswordCell, event: KeyboardEvent<HTMLInputElement>) {
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

    if (event.key === "Enter") {
      event.preventDefault();
      goToWord(1);
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

  function goToWord(step: 1 | -1) {
    if (orderedWords.length === 0) {
      return;
    }

    const currentIndex = orderedWords.findIndex((word) => word.id === activeWord?.id);
    const nextWord =
      orderedWords[(currentIndex + step + orderedWords.length) % orderedWords.length];
    handleClueClick(nextWord);
  }

  function handleCheck() {
    const result = evaluateCrossword(puzzle, values);
    setStatuses(result.statuses);
    setProgress(result);

    if (result.totalLetters > 0 && result.correctLetters === result.totalLetters) {
      setIsSolved(true);
      setShowCelebration(true);
    }
  }

  function handleReveal() {
    if (!activeWord) {
      return;
    }

    const cells = getPlacedWordCells(activeWord);
    const focusedInWord =
      focusedCellKey && cells.some((cell) => cell.key === focusedCellKey)
        ? focusedCellKey
        : null;
    const target =
      (focusedInWord && !lettersMatch(values[focusedInWord] ?? "", solution[focusedInWord])
        ? focusedInWord
        : null) ??
      cells.find((cell) => !lettersMatch(values[cell.key] ?? "", solution[cell.key]))?.key;

    if (!target) {
      goToWord(1);
      return;
    }

    setRevealed((current) => ({ ...current, [target]: true }));
    commitValues({ ...values, [target]: solution[target] }, target);

    const targetCell = cells.find((cell) => cell.key === target);

    if (targetCell) {
      focusCell(getNextCellKeyInWord(activeWord, targetCell.row, targetCell.col, 1) ?? target);
    }
  }

  const acrossWords = puzzle.placedWords.filter((word) => word.direction === "across");
  const downWords = puzzle.placedWords.filter((word) => word.direction === "down");
  const message = finalMessage || DEFAULT_FINAL_MESSAGE;
  const closeCelebration = useCallback(() => setShowCelebration(false), []);

  return (
    <section className="rounded-[2rem] border border-border bg-surface/90 p-4 shadow-[0_22px_60px_rgba(80,35,42,0.12)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold leading-none tracking-[-0.04em]">
            {title}
          </h2>
        </div>
        <p className="w-fit rounded-full bg-accent/10 px-4 py-2 text-sm font-extrabold text-accent">
          {filledLetters} / {totalLetters} harf
        </p>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_0.78fr]">
        <div className="min-w-0">
          {activeWord ? (
            <div className="sticky top-2 z-20 mb-3 flex items-center gap-2 rounded-2xl border border-accent/20 bg-surface p-2 shadow-[0_12px_30px_rgba(80,35,42,0.1)]">
              <button
                type="button"
                onClick={() => goToWord(-1)}
                aria-label="Önceki ipucu"
                className="grid size-10 shrink-0 place-items-center rounded-xl text-lg font-black text-accent transition hover:bg-accent/10"
              >
                ‹
              </button>
              <p className="min-w-0 flex-1 text-sm leading-5" aria-live="polite">
                <span className="font-extrabold text-accent">
                  {activeWord.number} {directionLabel[activeWord.direction]}
                </span>
                <span className="mx-1.5 text-muted">·</span>
                <span className="font-bold text-foreground">{activeWord.clue}</span>
                <span className="ml-1.5 text-muted">
                  ({Array.from(activeWord.answer).length})
                </span>
              </p>
              <button
                type="button"
                onClick={() => goToWord(1)}
                aria-label="Sonraki ipucu"
                className="grid size-10 shrink-0 place-items-center rounded-xl text-lg font-black text-accent transition hover:bg-accent/10"
              >
                ›
              </button>
            </div>
          ) : null}

          <div
            className="mx-auto grid w-full gap-[3px] rounded-3xl bg-accent/10 p-2 sm:gap-1 sm:p-3"
            style={{
              gridTemplateColumns: `repeat(${cropped.cols}, minmax(0, 1fr))`,
              maxWidth: `${Math.min(40, cropped.cols * 3.4)}rem`,
            }}
            aria-label="Çözülebilir bulmaca ızgarası"
          >
            {cropped.cells.map((cell) => {
              const key = getCellKey(cell.row, cell.col);

              return (
                <PlayableCell
                  cell={cell}
                  inputRef={(node) => {
                    inputRefs.current[key] = node;
                  }}
                  isActive={activeWordCellKeys.has(key)}
                  isFocused={focusedCellKey === key}
                  isRevealed={Boolean(revealed[key])}
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
            <p className="min-h-6 text-sm font-extrabold text-muted" aria-live="polite">
              {isSolved
                ? "Hepsi doğru ❤️"
                : progress
                  ? `${progress.correctLetters} / ${progress.totalLetters} harf doğru`
                  : "Bir kareye dokun ve yazmaya başla."}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReveal}
                disabled={isSolved}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-accent/25 bg-accent/10 px-5 text-sm font-extrabold text-accent transition hover:bg-accent/15 disabled:opacity-50 sm:flex-none"
              >
                Bir harf göster
              </button>
              <button
                type="button"
                onClick={isSolved ? () => setShowCelebration(true) : handleCheck}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-accent px-6 text-sm font-extrabold text-white shadow-[0_16px_38px_rgba(155,31,60,0.22)] transition hover:-translate-y-0.5 hover:brightness-90 focus:outline-none focus:ring-4 focus:ring-accent/25 sm:flex-none"
              >
                {isSolved ? "Mesajı tekrar aç" : "Kontrol et"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-4">
          {acrossWords.length > 0 ? (
            <ClueList
              activeWordId={activeWord?.id ?? ""}
              onSelectWord={handleClueClick}
              title="Yatay"
              words={acrossWords}
            />
          ) : null}
          {downWords.length > 0 ? (
            <ClueList
              activeWordId={activeWord?.id ?? ""}
              onSelectWord={handleClueClick}
              title="Dikey"
              words={downWords}
            />
          ) : null}
        </div>
      </div>

      {isSolved ? (
        <div className="mt-6 rounded-[2rem] border border-accent/20 bg-accent p-6 text-white shadow-[0_22px_60px_rgba(155,31,60,0.24)]">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-white/70">
            Final mesajı
          </p>
          <p className="mt-3 whitespace-pre-line font-display text-3xl font-bold leading-tight">
            {message}
          </p>
        </div>
      ) : null}

      {showCelebration ? (
        <Celebration
          message={message}
          onClose={closeCelebration}
          showCreateCta={showCreateCta}
        />
      ) : null}
    </section>
  );
}

const hearts = Array.from({ length: 18 }, (_, index) => ({
  left: (index * 37) % 100,
  delay: (index % 6) * 0.35,
  duration: 3.2 + (index % 5) * 0.45,
  size: 18 + ((index * 7) % 22),
}));

function Celebration({
  message,
  onClose,
  showCreateCta,
}: {
  message: string;
  onClose: () => void;
  showCreateCta: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function handleKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Rendered into <body>: ancestors with backdrop-filter would otherwise trap
  // this fixed overlay inside the card.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      className="celebration-backdrop fixed inset-0 z-50 grid place-items-center overflow-hidden p-5"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {hearts.map((heart, index) => (
          <span
            className="floating-heart absolute bottom-[-3rem] text-white/80"
            key={index}
            style={{
              left: `${heart.left}%`,
              fontSize: `${heart.size}px`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
            }}
          >
            ♥
          </span>
        ))}
      </div>

      <div className="celebration-card relative w-full max-w-lg rounded-[2rem] bg-surface p-7 text-center text-foreground shadow-[0_40px_120px_rgba(40,8,18,0.45)] sm:p-9">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-accent text-3xl text-white shadow-[0_16px_40px_rgba(155,31,60,0.35)]">
          ♥
        </div>
        <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
          Bulmacayı çözdün
        </p>
        <h2
          id="celebration-title"
          className="mt-4 whitespace-pre-line font-display text-[clamp(2rem,7vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]"
        >
          {message}
        </h2>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-extrabold text-muted outline-none transition hover:border-accent/40 hover:text-accent focus-visible:ring-4 focus-visible:ring-accent/25"
          >
            Bulmacaya dön
          </button>
          {showCreateCta ? (
            <Link
              href="/builder"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-extrabold text-white shadow-[0_16px_38px_rgba(155,31,60,0.22)] transition hover:brightness-90"
            >
              Sen de ona bir bulmaca hazırla
            </Link>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PlayableCell({
  cell,
  inputRef,
  isActive,
  isFocused,
  isRevealed,
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
  isRevealed: boolean;
  onChange: (cell: CrosswordCell, rawValue: string) => void;
  onClick: (cell: CrosswordCell) => void;
  onFocus: (cell: CrosswordCell) => void;
  onKeyDown: (cell: CrosswordCell, event: KeyboardEvent<HTMLInputElement>) => void;
  status?: CrosswordCellStatus;
  value: string;
}) {
  if (!isPlayableCell(cell)) {
    return <div aria-hidden="true" className="aspect-square rounded-[0.35rem]" />;
  }

  const statusClass =
    status === "correct"
      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
      : status === "incorrect"
        ? "border-accent bg-accent/10 text-accent"
        : isFocused
          ? "border-accent bg-surface text-foreground ring-2 ring-accent/30"
          : isActive
            ? "border-accent/35 bg-surface-rose text-foreground"
            : "border-border bg-surface text-foreground";

  return (
    <div className="relative aspect-square min-w-0">
      {cell.number ? (
        <span className="pointer-events-none absolute left-0.5 top-0.5 z-10 text-[0.55rem] font-extrabold leading-none text-accent sm:left-1 sm:top-1 sm:text-[0.62rem]">
          {cell.number}
        </span>
      ) : null}
      {isRevealed ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0.5 right-1 z-10 text-[0.5rem] text-gold"
        >
          ●
        </span>
      ) : null}
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(cell, event.target.value)}
        onClick={() => onClick(cell)}
        onFocus={() => onFocus(cell)}
        onKeyDown={(event) => onKeyDown(cell, event)}
        autoComplete="off"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        inputMode="text"
        aria-label={`${cell.number ? `${cell.number} numaralı kare, ` : ""}satır ${cell.row + 1}, sütun ${cell.col + 1}`}
        className={`size-full caret-transparent rounded-[0.35rem] border p-0 text-center text-base font-black uppercase outline-none transition sm:text-lg ${statusClass}`}
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
    <div className="rounded-3xl border border-border bg-surface/70 p-4">
      <h3 className="font-display text-3xl font-bold leading-none tracking-[-0.04em]">
        {title}
      </h3>
      <ul className="mt-4 grid gap-2">
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
                <span className="font-extrabold text-foreground">{word.number}. </span>
                {word.clue}
                <span className="ml-1 text-muted/80">({Array.from(word.answer).length})</span>
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
    key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp"
  );
}

function getDirectionForArrowKey(key: ArrowKey): CrosswordDirection {
  return key === "ArrowLeft" || key === "ArrowRight" ? "across" : "down";
}

function getStepForArrowKey(key: ArrowKey): 1 | -1 {
  return key === "ArrowLeft" || key === "ArrowUp" ? -1 : 1;
}
