import { getTracker } from "@/lib/data";
import { getViewer } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/supabase/server";
import { todayIso } from "@/lib/date";
import TopBar from "@/components/TopBar";
import TaskCalendar from "@/components/TaskCalendar";

export const instant = false;

export default async function Calendar({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const sp = await searchParams;
  const [tracker, viewer] = await Promise.all([getTracker(), getViewer()]);
  const today = todayIso();
  // bulan lalai = bulan semasa; ?m=YYYY-MM untuk navigasi. Tiada tarikh direka di sini.
  const ym = /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.m ?? "") ? (sp.m as string) : today.slice(0, 7);
  // Mod snapshot = satu mesin, tiada auth: tulis dibenarkan. Mod Supabase = ahli sahaja.
  const canWrite = !supabaseConfigured || Boolean(viewer?.canWrite);

  return (
    <>
      <TopBar viewer={viewer} mode={tracker.mode} generated={tracker.generated} />

      <div className="wrap">
        {tracker.note && (
          <div className="banner info">
            <span>{tracker.note}</span>
          </div>
        )}

        <section className="pagehead">
          <p className="kicker">Tarikh kerja</p>
          <h1>
            Kalendar <span>— bila setiap tugasan patut dibuat</span>
          </h1>
          <p className="sub">
            Chip <b>▸</b> = tarikh mula, chip <b>▪</b> = tarikh tamat, hari di antaranya ditanda
            sebagai julat. Klik mana-mana chip untuk buka butiran dan ubah tarikh/status.
          </p>
        </section>

        <TaskCalendar tasks={tracker.tasks} ym={ym} today={today} canWrite={canWrite} />
      </div>
    </>
  );
}
