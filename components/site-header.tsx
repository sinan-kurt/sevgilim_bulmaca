import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4">
      <BrandLogo />

      <nav aria-label="Ana menü" className="flex items-center gap-6 md:gap-8">
        <a
          className="hidden text-sm font-bold text-muted transition hover:text-accent md:inline"
          href="#dene"
        >
          Örnek bulmaca
        </a>
        <a
          className="hidden text-sm font-bold text-muted transition hover:text-accent md:inline"
          href="#nasil-calisir"
        >
          Nasıl çalışır?
        </a>
        <Link
          className="rounded-full border border-accent/20 bg-white/60 px-4 py-2.5 text-sm font-extrabold text-accent transition hover:border-accent hover:bg-accent hover:text-white"
          href="/builder"
        >
          Oluştur
        </Link>
      </nav>
    </header>
  );
}
