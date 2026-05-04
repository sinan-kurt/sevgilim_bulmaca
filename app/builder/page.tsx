import Link from "next/link";
import { PuzzleBuilderForm } from "@/components/builder/puzzle-builder-form";

export default function BuilderPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="romantic-glow pointer-events-none absolute inset-0" />
      <section className="paper-grain relative isolate min-h-screen overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <header className="flex items-center justify-between gap-4">
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

            <Link
              href="/"
              className="rounded-full border border-border bg-white/55 px-5 py-3 text-sm font-extrabold text-muted transition hover:border-accent/30 hover:text-accent"
            >
              Ana sayfa
            </Link>
          </header>

          <div className="grid gap-10 py-12 lg:grid-cols-[0.78fr_1.22fr] lg:py-16">
            <div className="max-w-xl">
              <h1 className="font-display text-[clamp(3.6rem,8vw,7rem)] font-bold leading-[0.82] tracking-[-0.06em]">
                Bulmacanı tasarla
              </h1>
              <p className="mt-7 text-lg leading-8 text-muted">
                İpuçlarını ve cevaplarını gir; biz şimdilik taslağı doğrulayıp
                konsola yazdıralım. Sonraki adımda bu taslak gerçek bulmaca
                üretiminin kalbi olacak.
              </p>
            </div>

            <PuzzleBuilderForm />
          </div>
        </div>
      </section>
    </main>
  );
}
