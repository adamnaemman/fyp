/**
 * Tarikh projek dikira dalam zon waktu Malaysia, bukan UTC.
 * Semua tarikh dalam app ialah string 'YYYY-MM-DD'.
 */
const TZ = "Asia/Kuala_Lumpur";
const MON = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

/** Tarikh hari ini di Malaysia. `new Date().toISOString()` salah setiap 00:00–08:00 MYT. */
export function todayIso(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts;
}

/** Cap masa tempatan untuk paparan: '2026-11-10 09:15'. */
export function klStamp(): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

/** '2026-11-13' → '13 Nov 2026' */
export function fmtDate(iso: string | null): string {
  if (!iso || iso.length < 10) return "tarikh tak terbaca";
  return `${iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
}

/** '2026-11-09', '2026-11-15' → '09–15 Nov 2026' */
export function fmtRange(start: string | null, end: string | null): string {
  if (!start || !end) return "tarikh tak terbaca";
  const [y1, m1, d1] = [start.slice(0, 4), +start.slice(5, 7), start.slice(8, 10)];
  const [y2, m2, d2] = [end.slice(0, 4), +end.slice(5, 7), end.slice(8, 10)];
  if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${MON[m2 - 1]} ${y2}`;
  return `${d1} ${MON[m1 - 1]} – ${d2} ${MON[m2 - 1]} ${y2}`;
}
