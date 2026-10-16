"use client";

import { useEffect, useState } from "react";
import { findCreatedPuzzle, whatsappShareUrl } from "@/lib/share";

/**
 * Shown only on the device that created this puzzle, so a creator who opens
 * their own link is reminded to send it instead of solving it.
 */
export function CreatorShareBar({ puzzleId }: { puzzleId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const created = findCreatedPuzzle(puzzleId);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads device-only storage after mount
    setUrl(created ? created.url : null);
  }, [puzzleId]);

  if (!url) {
    return null;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url ?? "");
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-[1.5rem] border border-accent/25 bg-surface/95 p-4 shadow-[0_16px_40px_rgba(80,35,42,0.12)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold leading-6 text-foreground">
        Bu bulmacayı sen hazırladın. Çözmeden önce ona gönder, sürprizi bozma 🙂
      </p>
      <div className="flex shrink-0 gap-2">
        <a
          href={whatsappShareUrl(url)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#1f8f4e] px-4 text-sm font-extrabold text-white sm:flex-none"
        >
          WhatsApp
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-accent/25 bg-accent/10 px-4 text-sm font-extrabold text-accent sm:flex-none"
        >
          {copied ? "Kopyalandı ✓" : "Linki kopyala"}
        </button>
      </div>
    </div>
  );
}
