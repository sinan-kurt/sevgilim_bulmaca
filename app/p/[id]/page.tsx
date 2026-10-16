import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { CreatorShareBar } from "@/components/creator-share-bar";
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

const shareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Sevgili Bulmacası: sana özel bir bulmaca",
};

// Link previews must not spoil the puzzle, so they never include its content.
export const metadata: Metadata = {
  title: "Sana özel bir bulmaca var 💌",
  description:
    "Biri senin için kişisel bir bulmaca hazırladı. İpuçları sadece ikinizin bildiği şeyler; çözünce sürpriz mesajı göreceksin.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Sana özel bir bulmaca var 💌",
    description: "Çöz, sonunda seni bir sürpriz bekliyor.",
    type: "website",
    locale: "tr_TR",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [shareImage],
  },
};

export default async function PuzzlePage({ params }: PuzzlePageProps) {
  const { id } = await params;
  const puzzle = await getPuzzle(id);

  if (!puzzle) {
    return <PuzzleNotFound />;
  }

  return (
    <main
      data-theme={puzzle.theme}
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
    >
      <div className="romantic-glow pointer-events-none absolute inset-0" />
      <section className="paper-grain relative isolate min-h-screen overflow-hidden px-4 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <header className="flex items-center justify-between gap-4">
            <BrandLogo />
          </header>

          <div className="py-8 lg:py-14">
            <CreatorShareBar puzzleId={puzzle.id} />
            <div className="mb-8 max-w-3xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-accent">
                Sana özel bir bulmaca
              </p>
              <h1 className="mt-4 font-display text-[clamp(3.2rem,8vw,6.8rem)] font-bold leading-[0.85] tracking-[-0.06em]">
                {puzzle.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
                İpuçları sadece ikinizin bildiği şeyler. Hepsini çözdüğünde seni
                bir mesaj bekliyor.
              </p>
            </div>

            <PlayableCrossword
              eyebrow="Hadi başla"
              finalMessage={puzzle.final_message}
              key={puzzle.id}
              puzzle={puzzle.crossword}
              showCreateCta
              storageKey={`sevgili-bulmaca:cozum:${puzzle.id}`}
              title="Şimdi çözme zamanı"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getPuzzle = cache(async (id: string): Promise<PuzzleRow | null> => {
  // Skip the database round trip for links that cannot be valid.
  if (!UUID_PATTERN.test(id)) {
    return null;
  }

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
});

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
            Link eksik kopyalanmış olabilir. Linki gönderen kişiden tekrar
            göndermesini isteyebilirsin.
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
