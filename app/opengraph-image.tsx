import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Sevgili Bulmacası: sana özel bir bulmaca";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const tiles = ["S", "E", "V", "G", "İ", "L", "İ"];

export default async function Image() {
  const fontDir = join(process.cwd(), "assets/og");
  const [displayLatin, displayExt, sansLatin, sansExt] = await Promise.all([
    readFile(join(fontDir, "cormorant-garamond-latin-700-normal.woff")),
    readFile(join(fontDir, "cormorant-garamond-latin-ext-700-normal.woff")),
    readFile(join(fontDir, "nunito-sans-latin-800-normal.woff")),
    readFile(join(fontDir, "nunito-sans-latin-ext-800-normal.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "70px 90px",
          background:
            "radial-gradient(circle at 15% 20%, rgba(248,201,198,1) 0%, rgba(248,201,198,0) 45%), radial-gradient(circle at 90% 85%, rgba(233,200,138,0.8) 0%, rgba(233,200,138,0) 40%), #fff8f3",
          color: "#351b22",
          fontFamily: "Nunito Sans, Nunito Sans Ext",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {tiles.map((letter, index) => (
            <div
              key={index}
              style={{
                width: 78,
                height: 78,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 800,
                background: index === 0 ? "#9b1f3c" : "#fae5df",
                color: index === 0 ? "#ffffff" : "#9b1f3c",
                boxShadow: "0 10px 24px rgba(80,35,42,0.12)",
              }}
            >
              {letter}
            </div>
          ))}
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#9b1f3c",
              marginLeft: 12,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2.2 4.5 6 4.5c2.2 0 3.6 1.2 6 3.6 2.4-2.4 3.8-3.6 6-3.6 3.8 0 5.7 3.9 4 7.2C19.5 16.4 12 21 12 21z" />
            </svg>
          </div>
        </div>
        <div
          style={{
            marginTop: 46,
            fontFamily: "Cormorant Garamond, Cormorant Garamond Ext",
            fontSize: 108,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
          }}
        >
          Sana özel bir bulmaca var
        </div>
        <div style={{ marginTop: 28, fontSize: 34, fontWeight: 800, color: "#7d5b61" }}>
          Çöz, sonunda seni bir sürpriz bekliyor.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant Garamond", data: displayLatin, weight: 700, style: "normal" },
        { name: "Cormorant Garamond Ext", data: displayExt, weight: 700, style: "normal" },
        { name: "Nunito Sans", data: sansLatin, weight: 800, style: "normal" },
        { name: "Nunito Sans Ext", data: sansExt, weight: 800, style: "normal" },
      ],
    },
  );
}
