import { getTracker } from "@/lib/data";
import { getViewer } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import BatchManager from "@/components/BatchManager";

export const instant = false;

export default async function Tugasan() {
  const [tracker, viewer] = await Promise.all([getTracker(), getViewer()]);
  // Mod snapshot = satu mesin, tiada auth: tulis dibenarkan ke fail setempat.
  // Mod Supabase = hanya ahli `members` (admin/member); server action menyemak semula.
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
        {tracker.mode === "snapshot" && !supabaseConfigured && (
          <div className="banner info">
            <span>
              Mod snapshot setempat — Supabase tiada dalam shell ini. Batch dan tugasan yang
              ditambah disimpan ke <code>web/data/local_batches.json</code> dan{" "}
              <code>web/data/local_tasks.json</code>, tidak dikongsi.
            </span>
          </div>
        )}

        <section className="pagehead">
          <p className="kicker">Urus kerja</p>
          <h1>
            Tugasan <span>— batch dan isinya</span>
          </h1>
          <p className="sub">
            Batch ialah kumpulan kerja (contoh: kerja audit bukti). Setiap batch boleh ada tarikh
            sendiri; tugasan di dalamnya boleh diberi tarikh mula/tamat yang muncul dalam Gantt dan
            Kalendar. Tarikh kosong kekal kosong — app tidak mengisi tarikh hari ini.
          </p>
        </section>

        <BatchManager
          batches={tracker.batches}
          tasks={tracker.tasks}
          canWrite={canWrite}
          batchesReady={tracker.batchesReady}
        />
      </div>
    </>
  );
}
