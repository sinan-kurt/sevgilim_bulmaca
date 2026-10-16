import Link from "next/link";
import { CrosswordPreview } from "@/components/crossword-preview";
import { PlayableCrossword } from "@/components/playable-crossword";
import { SiteHeader } from "@/components/site-header";
import { generateCrosswordPuzzle } from "@/lib/crossword";
import {
  demoFinalMessage,
  demoPairs,
  heroCopy,
  howItWorksSteps,
} from "@/lib/landing-content";

const demoPuzzle = generateCrosswordPuzzle(demoPairs);

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="romantic-glow pointer-events-none absolute inset-0" />
      <section className="paper-grain relative isolate overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-7xl flex-col">
          <SiteHeader />

          <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] items-center gap-14 py-14 lg:grid-cols-[1.03fr_0.97fr] lg:py-10">
            <div className="reveal-up mx-auto w-full min-w-0 max-w-3xl text-center lg:mx-0 lg:text-left">
              <h1 className="font-display text-[clamp(4.2rem,12vw,9.4rem)] font-bold leading-[0.78] tracking-[-0.07em] text-foreground">
                {heroCopy.titleLines.map((line, index) => (
                  <span className="block" key={line}>
                    {line}
                    {index < heroCopy.titleLines.length - 1 ? " " : null}
                  </span>
                ))}
              </h1>
              <p className="mx-auto mt-8 max-w-[22rem] text-lg leading-8 text-muted sm:max-w-2xl sm:text-xl lg:mx-0">
                {heroCopy.description}
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-center">
                <Link
                  href="/builder"
                  className="group inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-8 py-4 text-base font-extrabold text-white shadow-[0_18px_45px_rgba(155,31,60,0.25)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#7f1830] focus:outline-none focus:ring-4 focus:ring-accent/25"
                >
                  {heroCopy.cta}
                  <span
                    aria-hidden="true"
                    className="ml-3 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
                <a
                  href="#dene"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-border bg-white/60 px-7 text-base font-extrabold text-foreground transition hover:border-accent/40 hover:text-accent"
                >
                  Önce bir dene
                </a>
              </div>
              <p className="mt-5 text-sm font-bold text-muted">{heroCopy.note}</p>
            </div>

            <div className="reveal-up-delay">
              <CrosswordPreview puzzle={demoPuzzle} />
            </div>
          </div>
        </div>
      </section>

      <section
        id="nasil-calisir"
        className="relative scroll-mt-6 px-5 py-20 sm:px-8 lg:px-12"
      >
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
            Nasıl çalışır?
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.6rem,6vw,4.4rem)] font-bold leading-[0.9] tracking-[-0.05em]">
            Üç adımda ona özel bir bulmaca
          </h2>

          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {howItWorksSteps.map((step, index) => (
              <li
                className="rounded-[2rem] border border-border bg-surface/85 p-6 shadow-[0_18px_45px_rgba(80,35,42,0.08)]"
                key={step.title}
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-accent font-display text-2xl font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 font-display text-3xl font-bold leading-none tracking-[-0.03em]">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="dene" className="relative scroll-mt-6 px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
              Örnek bulmaca
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.4rem)] font-bold leading-[0.9] tracking-[-0.05em]">
              Karşı taraf bunu görecek
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted">
              Bir kareye dokun ve yazmaya başla. Takılırsan &ldquo;Bir harf
              göster&rdquo;e bas. Hepsini bitirince sürprizi gör.
            </p>
          </div>

          <PlayableCrossword
            eyebrow="Deneme"
            finalMessage={demoFinalMessage}
            puzzle={demoPuzzle}
            showCreateCta
            title="Aşkın küçük haritası"
          />

          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <p className="font-display text-3xl font-bold tracking-[-0.03em]">
              Şimdi sıra sizin anılarınızda.
            </p>
            <Link
              href="/builder"
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-8 py-4 text-base font-extrabold text-white shadow-[0_18px_45px_rgba(155,31,60,0.25)] transition hover:-translate-y-0.5 hover:bg-[#7f1830]"
            >
              {heroCopy.cta} →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
