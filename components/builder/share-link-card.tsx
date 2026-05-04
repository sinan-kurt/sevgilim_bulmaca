"use client";

import Link from "next/link";
import type { CreatePuzzleResponse } from "@/types/crossword";

type ShareLinkCardProps = {
  copyStatus: string;
  onCopy: () => void;
  share: CreatePuzzleResponse;
};

export function ShareLinkCard({ copyStatus, onCopy, share }: ShareLinkCardProps) {
  return (
    <aside className="rounded-[2rem] border border-accent/20 bg-white/82 p-6 shadow-[0_22px_60px_rgba(80,35,42,0.12)] backdrop-blur">
      <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
        Paylaşım linki
      </p>
      <h2 className="mt-3 font-display text-4xl font-bold leading-none tracking-[-0.04em]">
        Bulmacan hazır. Şimdi sevgiline gönderebilirsin ❤️
      </h2>

      <div className="mt-5 rounded-3xl border border-border bg-surface p-4">
        <p className="break-all text-sm font-bold leading-6 text-muted">
          {share.url}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent/25 bg-accent/10 px-5 text-sm font-extrabold text-accent transition hover:-translate-y-0.5 hover:bg-accent hover:text-white"
        >
          Linki Kopyala
        </button>
        <Link
          href={`/p/${share.id}`}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-extrabold text-white shadow-[0_16px_38px_rgba(155,31,60,0.22)] transition hover:-translate-y-0.5 hover:bg-[#7f1830]"
        >
          Bulmacayı Aç
        </Link>
      </div>

      {copyStatus ? (
        <p className="mt-3 text-sm font-extrabold text-muted">{copyStatus}</p>
      ) : null}
    </aside>
  );
}
