import Link from "next/link";
import { CrosswordPreview } from "@/components/crossword-preview";
import { SiteHeader } from "@/components/site-header";
import { heroCopy } from "@/lib/landing-content";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="romantic-glow pointer-events-none absolute inset-0" />
      <section className="paper-grain relative isolate min-h-screen overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col">
          <SiteHeader />

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] flex-1 items-center gap-14 py-14 lg:grid-cols-[1.03fr_0.97fr] lg:py-10">
            <div className="reveal-up mx-auto w-full min-w-0 max-w-3xl text-center lg:mx-0 lg:text-left">
              <h1 className="font-display text-[clamp(4.2rem,12vw,9.4rem)] font-bold leading-[0.78] tracking-[-0.07em] text-foreground">
                {heroCopy.titleLines.map((line) => (
                  <span className="block" key={line}>
                    {line}
                  </span>
                ))}
              </h1>
              <p className="mx-auto mt-8 max-w-[21rem] text-lg leading-8 text-muted sm:max-w-2xl sm:text-xl lg:mx-0">
                {heroCopy.description}
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                <Link
                  href="/builder"
                  className="group inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-8 py-4 text-base font-extrabold text-white shadow-[0_18px_45px_rgba(155,31,60,0.25)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#7f1830] focus:outline-none focus:ring-4 focus:ring-accent/25"
                >
                  {heroCopy.cta}
                  <span
                    aria-hidden="true"
                    className="ml-3 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    -&gt;
                  </span>
                </Link>
                <p className="max-w-xs text-sm leading-6 text-muted">
                  İlk taslak için sadece birkaç anı, birkaç kelime ve biraz
                  kalp yeter.
                </p>
              </div>
            </div>

            <div className="reveal-up-delay">
              <CrosswordPreview />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
