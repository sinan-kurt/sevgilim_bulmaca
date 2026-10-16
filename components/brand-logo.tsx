import Link from "next/link";

export function BrandLogo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 text-left"
      aria-label="Sevgili Bulmacası ana sayfa"
    >
      <span
        aria-hidden="true"
        className="grid size-11 place-items-center rounded-2xl bg-accent text-lg font-black text-white shadow-[0_12px_30px_rgba(155,31,60,0.22)] transition duration-300 group-hover:-rotate-3"
      >
        S
      </span>
      <span className="flex flex-col" aria-hidden="true">
        <span className="font-display text-2xl font-bold leading-none tracking-[-0.04em]">
          Sevgili
        </span>{" "}
        <span className="text-xs font-extrabold uppercase tracking-[0.28em] text-muted">
          Bulmacası
        </span>
      </span>
    </Link>
  );
}
