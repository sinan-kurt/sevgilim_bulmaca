import type { PuzzleQuestionPair } from "@/types/crossword";

export const heroCopy = {
  titleLines: ["Sevgili", "Bulmacası"],
  description:
    "Anılarınızı, iç şakalarınızı ve sadece ikinizin bildiği kelimeleri ona özel bir bulmacaya dönüştürün. Çözdüğünde senin mesajın açılsın.",
  cta: "Bulmacamı Oluştur",
  note: "Ücretsiz · Üyelik gerekmez",
} as const;

/** Example puzzle shown on the landing page. Every answer here is in the grid. */
export const demoPairs: PuzzleQuestionPair[] = [
  { clue: "İlk buluşmamızda içtiğimiz şey", answer: "KAHVE" },
  { clue: "İlk tanıştığımız semt", answer: "KADIKÖY" },
  { clue: "Birlikte izlemeye doyamadığımız şey", answer: "DENİZ" },
  { clue: "Ona taktığım lakap", answer: "BALIM" },
  { clue: "Her gece son mesajımız", answer: "İYİGECELER" },
];

export const demoFinalMessage =
  "İşte böyle! Senin bulmacanda bu mesajı sen yazacaksın ❤️";

export const howItWorksSteps = [
  {
    title: "Anılarını yaz",
    description:
      "İpucu olarak bir anı, cevap olarak tek bir kelime. İlk buluştuğunuz yer, ona taktığın lakap, sadece ikinizin güldüğü şaka…",
  },
  {
    title: "Bulmaca kendiliğinden kurulsun",
    description:
      "Kelimeler yazarken ızgaraya yerleşir. Sığmayan bir kelime olursa hemen görürsün, göndermeden düzeltirsin.",
  },
  {
    title: "Linki gönder",
    description:
      "Sana özel bir link oluşur. Ona WhatsApp'tan gönder; bulmacayı çözdüğünde yazdığın final mesajı ekranında açılır.",
  },
] as const;

/** Ready-made clue ideas for the builder. */
export const clueSuggestions = [
  "İlk tanıştığımız yer",
  "İlk buluşmamızda yediğimiz şey",
  "Ona taktığım lakap",
  "Birlikte izlediğimiz ilk film",
  "En sevdiği renk",
  "Sadece ikimizin anladığı şaka",
  "Birlikte gitmek istediğimiz şehir",
  "İlk mesajımda yazdığım kelime",
  "Bizim şarkımızın sanatçısı",
  "Evcil hayvanımızın / hayalimizdeki kedinin adı",
  "Bana en çok söylediği kelime",
  "İlk hediyem",
] as const;
