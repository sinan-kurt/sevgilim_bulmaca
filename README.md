# Sevgili Bulmacası

Anıları ve kişisel kelimeleri, paylaşılabilir bir romantik bulmacaya dönüştüren Next.js uygulaması.

## Geliştirme

```bash
npm install
npm run dev
```

`.env.local` içinde şunlar gerekir:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Veritabanı şeması `supabase/schema.sql` içinde. Tablo RLS açık ve policy'siz; tüm okuma/yazma sunucuda service role ile yapılır.

## Yapı

- `app/page.tsx`: ana sayfa (örnek bulmaca + nasıl çalışır)
- `app/builder`: bulmaca oluşturma formu, canlı önizleme
- `app/p/[id]`: paylaşılan bulmaca (temalı, arama motorlarına kapalı)
- `app/opengraph-image.tsx`: WhatsApp/sosyal medya paylaşım görseli (`assets/og` fontlarıyla)
- `lib/crossword.ts`: kelime yerleştirme algoritması
