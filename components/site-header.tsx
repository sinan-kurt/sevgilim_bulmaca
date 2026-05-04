import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between">
      <Link
        href="/"
        className="group flex items-center gap-3 text-left"
        aria-label="Sevgili Bulmacası ana sayfa"
      >
        <span className="grid size-11 place-items-center rounded-2xl bg-accent text-lg font-black text-white shadow-[0_12px_30px_rgba(155,31,60,0.22)] transition duration-300 group-hover:-rotate-3">
          S
        </span>
        <span className="flex flex-col">
          <span className="font-display text-2xl font-bold leading-none tracking-[-0.04em]">
            Sevgili
          </span>
          <span className="text-xs font-extrabold uppercase tracking-[0.28em] text-muted">
            Bulmacası
          </span>
        </span>
      </Link>

      <nav aria-label="Ana menü" className="hidden items-center gap-8 md:flex">
        <a className="text-sm font-bold text-muted transition hover:text-accent" href="#bulmaca-onizleme">
          Önizleme
        </a>
        <a className="text-sm font-bold text-muted transition hover:text-accent" href="#bulmaca-onizleme">
          Nasıl çalışır?
        </a>
      </nav>
    </header>
  );
}
