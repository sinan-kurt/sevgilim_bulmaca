/**
 * Supabase pauses free projects after a week without activity, which makes
 * every "Bulmacayı Oluştur" request fail. This runs once a day on Netlify and
 * makes one tiny read so the database stays awake.
 */
export default async function keepAlive() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/^["']|["']$/g, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^["']|["']$/g, "");

  if (!url || !key) {
    console.error("[keepalive] Supabase env vars are missing.");
    return new Response("missing env", { status: 500 });
  }

  const response = await fetch(`${url}/rest/v1/puzzles?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });

  console.log(`[keepalive] Supabase responded with ${response.status}`);
  return new Response(`supabase ${response.status}`, { status: response.ok ? 200 : 502 });
}

export const config = {
  schedule: "@daily",
};
