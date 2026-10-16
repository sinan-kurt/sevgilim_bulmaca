"use client";

import { useEffect, useRef, useState } from "react";
import { SHARE_TEXT, whatsappShareUrl } from "@/lib/share";
import type { CreatePuzzleResponse } from "@/types/crossword";

type ShareLinkCardProps = {
  share: CreatePuzzleResponse;
  title: string;
  onCreateNew: () => void;
};

/** Full screen shown right after a puzzle is saved: the creator's next step is sending it. */
export function ShareLinkCard({ share, title, onCreateNew }: ShareLinkCardProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    headingRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection after mount
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(share.url);
      setCopyStatus("Link kopyalandı ✓");
    } catch {
      setCopyStatus("Kopyalanamadı. Yukarıdaki linki basılı tutup kopyalayabilirsin.");
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "Sana özel bir bulmaca 💌", text: SHARE_TEXT, url: share.url });
    } catch {
      // The person closed the share sheet; nothing to do.
    }
  }

  const primaryButton =
    "inline-flex min-h-14 w-full items-center justify-center rounded-full px-6 text-base font-extrabold text-white transition hover:-translate-y-0.5";
  const secondaryButton =
    "inline-flex min-h-12 w-full items-center justify-center rounded-full border border-accent/25 bg-accent/10 px-5 text-sm font-extrabold text-accent transition hover:bg-accent hover:text-white";

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-xl scroll-mt-4 rounded-[2rem] border border-accent/20 bg-surface/95 p-6 text-center shadow-[0_28px_80px_rgba(80,35,42,0.16)] backdrop-blur sm:p-9"
    >
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-accent text-3xl text-white shadow-[0_16px_40px_rgba(155,31,60,0.3)]">
        ♥
      </div>
      <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
        Bulmacan hazır
      </p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 font-display text-[clamp(2.4rem,7vw,3.4rem)] font-bold leading-[0.95] tracking-[-0.04em] outline-none"
      >
        Şimdi ona gönder
      </h2>
      <p className="mx-auto mt-4 max-w-sm leading-7 text-muted">
        {title ? <>&ldquo;{title}&rdquo; hazır. </> : null}
        Linki açtığında bulmacayı görecek, son harfi yazınca senin mesajın açılacak.
        Sen çözme, sürpriz bozulmasın 🙂
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-white/70 p-4">
        <p className="select-all break-all text-sm font-bold leading-6 text-foreground">{share.url}</p>
      </div>

      <div className="mt-5 grid gap-3">
        <a
          href={whatsappShareUrl(share.url)}
          rel="noreferrer"
          target="_blank"
          className={`${primaryButton} bg-[#1f8f4e] shadow-[0_16px_38px_rgba(31,143,78,0.25)]`}
        >
          WhatsApp&apos;tan gönder
        </a>
        {canNativeShare ? (
          <button
            type="button"
            onClick={nativeShare}
            className={`${primaryButton} bg-accent shadow-[0_16px_38px_rgba(155,31,60,0.22)]`}
          >
            Başka bir uygulamayla paylaş
          </button>
        ) : null}
        <button type="button" onClick={copyLink} className={secondaryButton}>
          Linki kopyala
        </button>
        <p className="min-h-5 text-sm font-extrabold text-muted" aria-live="polite">
          {copyStatus}
        </p>
      </div>

      <div className="mt-2 flex flex-col items-center gap-2 border-t border-border pt-5 text-sm font-bold sm:flex-row sm:justify-center sm:gap-6">
        <a
          href={share.url}
          target="_blank"
          rel="noreferrer"
          className="text-muted underline underline-offset-4 transition hover:text-accent"
        >
          Nasıl göründüğüne bak ↗
        </a>
        <button
          type="button"
          onClick={onCreateNew}
          className="text-muted underline underline-offset-4 transition hover:text-accent"
        >
          Yeni bir bulmaca hazırla
        </button>
      </div>
    </section>
  );
}
