import type { Metadata } from "next";
import Link from "next/link";
import { PuzzleBuilderForm } from "@/components/builder/puzzle-builder-form";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Bulmacanı Oluştur | Sevgili Bulmacası",
  description:
    "Birkaç anı ve kelimeyle ona özel bir bulmaca hazırla, linkini gönder.",
};

export default function BuilderPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="romantic-glow pointer-events-none absolute inset-0" />
      <section className="paper-grain relative isolate min-h-screen overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <header className="flex items-center justify-between gap-4">
            <BrandLogo />

            <Link
              href="/"
              className="rounded-full border border-border bg-white/55 px-5 py-3 text-sm font-extrabold text-muted transition hover:border-accent/30 hover:text-accent"
            >
              Ana sayfa
            </Link>
          </header>

          <div className="py-10 lg:py-14">
            <div className="mb-8 max-w-2xl">
              <h1 className="font-display text-[clamp(3.2rem,8vw,6rem)] font-bold leading-[0.85] tracking-[-0.06em]">
                Bulmacanı tasarla
              </h1>
              <p className="mt-5 text-lg leading-8 text-muted">
                Her soru için bir ipucu ve tek kelimelik bir cevap yaz. Kelimeler
                yazdıkça önizlemede ızgaraya yerleşir. Taslağın bu cihazda otomatik
                saklanır.
              </p>
            </div>

            <PuzzleBuilderForm />
          </div>
        </div>
      </section>
    </main>
  );
}
