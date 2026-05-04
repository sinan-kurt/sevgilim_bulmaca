import Link from "next/link";
import { PlayableCrossword } from "@/components/playable-crossword";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { CrosswordPuzzle, PuzzleQuestionPair, PuzzleTheme } from "@/types/crossword";

export const dynamic = "force-dynamic";

type PuzzlePageProps = {
  params: Promise<{ id: string }>;
};

type PuzzleRow = {
  id: string;
  title: string;
  theme: PuzzleTheme;
  final_message: string;
  questions: PuzzleQuestionPair[];
  crossword: CrosswordPuzzle;
  created_at: string;
};

export default async function PuzzlePage({ params }: PuzzlePageProps) {
  const { id } = await params;
  const puzzle = await getPuzzle(id);

  if (!puzzle) {
    return <PuzzleNotFound />;
  }

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
          </header>

          <div className="py-12 lg:py-16">
            <div className="mb-8 max-w-3xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
                Paylaşılan bulmaca
              </p>
              <h1 className="mt-4 font-display text-[clamp(3.2rem,8vw,6.8rem)] font-bold leading-[0.85] tracking-[-0.06em]">
                {puzzle.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
                Tema: <span className="font-extrabold">{puzzle.theme}</span>
              </p>
            </div>

            <PlayableCrossword
              finalMessage={puzzle.final_message}
              key={puzzle.id}
              puzzle={puzzle.crossword}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

async function getPuzzle(id: string): Promise<PuzzleRow | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("puzzles")
      .select("id,title,theme,final_message,questions,crossword,created_at")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as PuzzleRow;
  } catch {
    return null;
  }
}

function PuzzleNotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="romantic-glow pointer-events-none absolute inset-0" />
      <section className="paper-grain relative isolate grid min-h-screen place-items-center overflow-hidden px-5 py-10">
        <div className="max-w-xl rounded-[2rem] border border-border bg-surface/88 p-8 text-center shadow-[0_22px_60px_rgba(80,35,42,0.12)] backdrop-blur">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
            Bulmaca bulunamadı
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-none tracking-[-0.05em]">
            Bu link biraz kaybolmuş.
          </h1>
          <p className="mt-5 leading-7 text-muted">
            Bulmaca silinmiş, link yanlış kopyalanmış ya da Supabase bağlantısı
            henüz yapılandırılmamış olabilir.
          </p>
          <Link
            href="/builder"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-extrabold text-white shadow-[0_16px_38px_rgba(155,31,60,0.22)] transition hover:-translate-y-0.5 hover:bg-[#7f1830]"
          >
            Yeni bulmaca oluştur
          </Link>
        </div>
      </section>
    </main>
  );
}
