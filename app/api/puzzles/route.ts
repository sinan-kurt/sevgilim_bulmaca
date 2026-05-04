import { NextRequest, NextResponse } from "next/server";
import { puzzleThemes } from "@/lib/puzzle-validation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type {
  CreatePuzzleRequest,
  CreatePuzzleResponse,
  CrosswordPuzzle,
  PuzzleDraft,
  PuzzleQuestionPair,
  PuzzleTheme,
} from "@/types/crossword";

type PuzzleInsert = {
  title: string;
  theme: PuzzleTheme;
  final_message: string;
  questions: PuzzleQuestionPair[];
  crossword: CrosswordPuzzle;
};

const DEFAULT_TITLE = "İsimsiz Bulmaca";
const DEFAULT_FINAL_MESSAGE =
  "Bulmacayı çözdün... çünkü beni en iyi sen tanıyorsun ❤️";

export async function POST(request: NextRequest) {
  let payload: Partial<CreatePuzzleRequest>;

  try {
    payload = (await request.json()) as Partial<CreatePuzzleRequest>;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi." }, { status: 400 });
  }

  const validation = validateCreatePuzzlePayload(payload);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const insertPayload: PuzzleInsert = {
    title: validation.draft.title.trim() || DEFAULT_TITLE,
    theme: validation.draft.theme,
    final_message: validation.draft.finalMessage.trim() || DEFAULT_FINAL_MESSAGE,
    questions: validation.draft.pairs,
    crossword: validation.crossword,
  };

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("puzzles")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error || !data?.id) {
      return NextResponse.json(
        { error: "Bulmaca kaydedilemedi." },
        { status: 500 },
      );
    }

    const response: CreatePuzzleResponse = {
      id: data.id,
      url: `${request.nextUrl.origin}/p/${data.id}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Supabase yapılandırması hatalı.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function validateCreatePuzzlePayload(
  payload: Partial<CreatePuzzleRequest>,
):
  | { ok: true; draft: PuzzleDraft; crossword: CrosswordPuzzle }
  | { ok: false; error: string } {
  if (!payload.draft || !payload.crossword) {
    return { ok: false, error: "PuzzleDraft ve CrosswordPuzzle gerekli." };
  }

  const draft = payload.draft;
  const crossword = payload.crossword;

  if (!puzzleThemes.includes(draft.theme)) {
    return { ok: false, error: "Geçersiz tema." };
  }

  if (!Array.isArray(draft.pairs) || draft.pairs.length === 0) {
    return { ok: false, error: "En az bir soru-cevap çifti gerekli." };
  }

  if (
    draft.pairs.some(
      (pair) => !pair.clue?.trim() || !pair.answer?.trim(),
    )
  ) {
    return { ok: false, error: "Tüm soruların ipucu ve cevabı olmalı." };
  }

  if (!Array.isArray(crossword.grid) || crossword.grid.length === 0) {
    return { ok: false, error: "Geçerli crossword grid gerekli." };
  }

  if (!Array.isArray(crossword.placedWords) || crossword.placedWords.length === 0) {
    return { ok: false, error: "Yerleştirilmiş kelime gerekli." };
  }

  if (!Array.isArray(crossword.unplacedWords)) {
    return { ok: false, error: "unplacedWords alanı gerekli." };
  }

  return { ok: true, draft, crossword };
}
