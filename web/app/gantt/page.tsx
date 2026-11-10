import { getTracker } from "@/lib/data";
import { getViewer } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/supabase/server";
import { todayIso } from "@/lib/date";
import TopBar from "@/components/TopBar";
import GanttChart from "@/components/GanttChart";
import TaskForm from "@/components/TaskForm";

export const instant = false;

export default async function Gantt() {
  const [tracker, viewer] = await Promise.all([getTracker(), getViewer()]);
  const today = todayIso();
  // Mod snapshot = satu mesin, tiada auth: tulis dibenarkan ke data/local_tasks.json.
  // Mod Supabase = hanya ahli members (admin/member); server action tetap menyemak.
  // canWrite di sini mesti sepadan dengan semakan dalam task-actions.ts, kalau tidak
  // butang nampak aktif tetapi simpanan ditolak.
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
              Mod snapshot setempat — Supabase tiada dalam shell ini. Tugasan yang ditambah
              disimpan ke <code>web/data/local_tasks.json</code> dan tidak dikongsi.
            </span>
          </div>
        )}

        <section className="pagehead">
          <p className="kicker">Susunan kerja</p>
          <h1>
            Gantt <span>— 11 minggu FYP1</span>
          </h1>
          <p className="sub">
            Lajur ialah minggu daripada jadual <code>weeks</code>. Bar mengikut{" "}
            <code>start_date</code> → <code>end_date</code> setiap tugasan. Status ialah pilihan
            manusia, bukan kiraan daripada tarikh.
          </p>
        </section>

        <GanttChart
          tasks={tracker.tasks}
          weeks={tracker.weeks.map((w) => ({ id: w.id, label: w.label, start: w.start, end: w.end }))}
          today={today}
          canWrite={canWrite}
        />

        <h2 className="sec">Tambah tugasan</h2>
        <p className="secnote">
          Tarikh boleh dibiarkan kosong — tugasan itu masuk senarai <b>Belum dijadualkan</b>,
          bukan dilekatkan pada hari ini.{" "}
          {canWrite
            ? "Anda ahli: simpanan terus ke pangkalan data."
            : "Akaun tetamu/penyelia: hantar akan dipulangkan “baca sahaja”."}
        </p>
        <div className="panel">
          <div className="pb" style={{ paddingTop: 14 }}>
            <TaskForm canWrite={canWrite} />
          </div>
        </div>
      </div>
    </>
  );
}
