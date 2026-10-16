"use client";

import type { CreatePuzzleResponse } from "@/types/crossword";

type ShareLinkCardProps = {
  copyStatus: string;
  onCopy: () => void;
  share: CreatePuzzleResponse;
};

const SHARE_TEXT = "Sana özel bir bulmaca hazırladım 💌 Çözünce sürprizi göreceksin:";

export function ShareLinkCard({ copyStatus, onCopy, share }: ShareLinkCardProps) {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${share.url}`)}`;

  return (
    <aside className="rounded-[2rem] border border-accent/20 bg-white/82 p-5 sm:p-6 shadow-[0_22px_60px_rgba(80,35,42,0.12)] backdrop-blur">
      <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
        Paylaşım linki
      </p>
      <h2 className="mt-3 font-display text-4xl font-bold leading-none tracking-[-0.04em]">
        Bulmacan hazır ❤️
      </h2>
      <p className="mt-3 leading-7 text-muted">
        Linki ona gönder. Açtığında bulmacayı görecek, çözünce final mesajın açılacak.
      </p>

      <div className="mt-5 rounded-3xl border border-border bg-surface p-4">
        <p className="break-all text-sm font-bold leading-6 text-muted">
          {share.url}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={whatsappUrl}
          rel="noreferrer"
          target="_blank"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1f8f4e] px-5 text-sm font-extrabold text-white shadow-[0_16px_38px_rgba(31,143,78,0.22)] transition hover:-translate-y-0.5 hover:brightness-95"
        >
          WhatsApp&apos;tan gönder
        </a>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent/25 bg-accent/10 px-5 text-sm font-extrabold text-accent transition hover:-translate-y-0.5 hover:bg-accent hover:text-white"
        >
          Linki Kopyala
        </button>
        <a
          href={share.url}
          rel="noreferrer"
          target="_blank"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-extrabold text-white shadow-[0_16px_38px_rgba(155,31,60,0.22)] transition hover:-translate-y-0.5 hover:bg-[#7f1830]"
        >
          Bulmacayı Aç
        </a>
      </div>

      {copyStatus ? (
        <p className="mt-3 text-sm font-extrabold text-muted">{copyStatus}</p>
      ) : null}
    </aside>
  );
}
