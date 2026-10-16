const CREATED_STORAGE_KEY = "sevgili-bulmaca:olusturduklarim";

export const SHARE_TEXT =
  "Sana özel bir bulmaca hazırladım 💌 Çözünce sürprizi göreceksin:";

export type CreatedPuzzle = { id: string; url: string; title: string };

export function whatsappShareUrl(url: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${url}`)}`;
}

function readCreated(): CreatedPuzzle[] {
  try {
    const raw = window.localStorage.getItem(CREATED_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CreatedPuzzle[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Remembers puzzles made on this device so their page can show share tools to the creator. */
export function rememberCreatedPuzzle(puzzle: CreatedPuzzle) {
  try {
    const next = [puzzle, ...readCreated().filter((item) => item.id !== puzzle.id)].slice(0, 20);
    window.localStorage.setItem(CREATED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: sharing still works from the builder screen.
  }
}

export function findCreatedPuzzle(id: string) {
  return readCreated().find((item) => item.id === id) ?? null;
}
