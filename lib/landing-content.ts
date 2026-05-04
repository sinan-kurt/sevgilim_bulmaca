import type { CrosswordTile, MemoryPrompt } from "@/types/crossword";

export const heroCopy = {
  titleLines: ["Sevgili", "Bulmacası"],
  description:
    "Anılarınızı, şakalarınızı ve özel kelimelerinizi kişiye özel romantik bir bulmacaya dönüştürün.",
  cta: "Bulmacamı Oluştur",
} as const;

export const crosswordTiles: CrosswordTile[] = [
  { letter: "B", tone: "accent" },
  { letter: "İ", tone: "ivory" },
  { letter: "Z", tone: "ivory" },
  { letter: "", tone: "empty" },
  { letter: "K", tone: "rose" },
  { letter: "A", tone: "rose" },
  { letter: "L", tone: "rose" },
  { letter: "", tone: "empty" },
  { letter: "", tone: "empty" },
  { letter: "İ", tone: "gold" },
  { letter: "", tone: "empty" },
  { letter: "", tone: "empty" },
  { letter: "P", tone: "accent" },
  { letter: "", tone: "empty" },
  { letter: "A", tone: "rose" },
  { letter: "N", tone: "rose" },
  { letter: "I", tone: "gold" },
  { letter: "M", tone: "rose" },
  { letter: "", tone: "empty" },
  { letter: "A", tone: "ivory" },
  { letter: "Ş", tone: "ivory" },
  { letter: "", tone: "empty" },
  { letter: "I", tone: "ivory" },
  { letter: "L", tone: "gold" },
  { letter: "K", tone: "ivory" },
  { letter: "", tone: "empty" },
  { letter: "K", tone: "rose" },
  { letter: "", tone: "empty" },
  { letter: "G", tone: "ivory" },
  { letter: "Ü", tone: "ivory" },
  { letter: "L", tone: "gold" },
  { letter: "Ü", tone: "ivory" },
  { letter: "Ş", tone: "ivory" },
  { letter: "", tone: "empty" },
  { letter: "M", tone: "accent" },
];

export const memoryPrompts: MemoryPrompt[] = [
  {
    title: "1. İlk mesajımızda geçen kelime",
    description: "Cevap: merhaba ama biraz daha heyecanlı hali.",
  },
  {
    title: "2. En çok güldüğümüz ortak şaka",
    description: "Bulmacaya sadece ikinizin anlayacağı bir iz bırakır.",
  },
];
