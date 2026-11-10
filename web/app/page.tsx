import { computeStats, getTracker } from "@/lib/data";
import { getViewer } from "@/lib/auth";
import TopBar from "@/components/TopBar";
import StatCards from "@/components/StatCards";
import WeekCard from "@/components/WeekCard";
import Tasks from "@/components/Tasks";
import Milestones from "@/components/Milestones";
import Blocked from "@/components/Blocked";
import LinksCard from "@/components/LinksCard";
import { Plans, Specs } from "@/components/SpecsPlans";
import { fmtDate, todayIso } from "@/lib/date";


// Halaman ini baca cookie sesi + pangkalan data pada setiap permintaan.
// Next 16 (cacheComponents) mahu prerender; tracker mesti segar, jadi blocking dibenarkan.
export const instant = false;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const [tracker, viewer] = await Promise.all([getTracker(), getViewer()]);
  const s = computeStats(tracker);
  const canWrite = Boolean(viewer?.canWrite);
  const today = todayIso();

  const nextWhen =
    s.nextDays === null ? "" : s.nextDays === 0 ? "hari ini" : s.nextDays === 1 ? "esok" : `${s.nextDays} hari lagi`;

  return (
    <>
      <TopBar viewer={viewer} mode={tracker.mode} generated={tracker.generated} />

      <div className="wrap">
        {sp.err && (
          <div className="banner err">
            <strong>Gagal:</strong> {sp.err}
          </div>
        )}
        {sp.ok && (
          <div className="banner ok">
            <strong>Disimpan.</strong> Angka di bawah sudah dikemas kini.
          </div>
        )}
        {tracker.note && (
          <div className="banner info">
            <span>{tracker.note}</span>
          </div>
        )}
        {!viewer && (
          <div className="banner info">
            <span>
              Anda melihat sebagai tetamu — semua kotak baca sahaja.{" "}
              <a href="/login">Log masuk</a> untuk menanda.
            </span>
          </div>
        )}

        <section className="hero">
          <div>
            <p className="kicker">
              Minggu aktif · {s.activeLabel} daripada {s.weeksTotal}
            </p>
            <h1>
              Progres FYP1 <span>— BagSense</span>
            </h1>
            <p className="sub">
              Beg pintar Edge-IoT: ESP32-S3, pembaca UHF RFID 919–923 MHz, E-paper, app Flutter.
              Kiraan bukti datang dari fail projek; status gate ditanda oleh manusia — bukan dikira
              dari bilangan fail.
            </p>
            <div className="chips">
              <span className="chip">
                Tempoh projek <b>{s.span}</b>
              </span>
              <span className="chip hot">
                Seterusnya · <b>{s.nextLabel}</b>
                {s.nextDate ? ` · ${fmtDate(s.nextDate)} · ${nextWhen}` : ""}
              </span>
              <span className="chip">
                Tersekat <b>{s.blocked}</b>
              </span>
            </div>
          </div>
          <div className="ring" style={{ ["--p" as string]: s.elapsed }}>
            <div className="in">
              <b>
                {s.elapsed}
                <span>%</span>
              </b>
              <em>masa berlalu</em>
            </div>
          </div>
        </section>

        <StatCards s={s} />

        <h2 className="sec">Garis masa mingguan</h2>
        <p className="secnote">
          Teks gate disalin terus dari README minggu. Status gate hanya berubah bila ada orang
          menekannya — fail yang banyak <b>bukan</b> bukti lulus.
        </p>
        <div className="tl">
          {tracker.weeks.map((w) => (
            <WeekCard key={w.id} week={w} canWrite={canWrite} />
          ))}
        </div>

        <h2 className="sec">Kerja aktif dan tarikh penting</h2>
        <p className="secnote">
          Klik lencana status untuk pusing status (brief → jalan → semak → siap). Kiraan tugasan
          datang dari TASKBOARD; tarikh dari FACTS.
        </p>
        <div className="cols">
          <Tasks tasks={tracker.tasks} canWrite={canWrite} done={s.tasksDone} total={s.tasksTotal} />
          <div>
            <Milestones milestones={tracker.milestones} today={today} />
            <Blocked items={tracker.blocked} canWrite={canWrite} />
          </div>
        </div>

        <h2 className="sec">Skop dan pelan sandaran</h2>
        <p className="secnote">
          Spesifikasi terkunci dan Plan B/C disalin dari pelan induk — ini yang menghalang keputusan
          panik pada minggu ke-12.
        </p>
        <div className="cols">
          <Specs specs={tracker.specs} />
          <Plans plans={tracker.plans} />
        </div>

        <h2 className="sec">Pautan</h2>
        <p className="secnote">
          Dua pautan yang selalu dicari: dokumen laporan dan kod. Sidebar kekal seperti sebelum ini.
        </p>
        <LinksCard />

        <div className="caveat">
          <h3>Apa yang halaman ini tak tahu</h3>
          <p>
            Kiraan dokumen/kod datang dari <code>tracker/export_snapshot.py</code> yang mengira fail
            dalam <code>Week*/Output</code> dan <code>Report/</code> pada laptop. Kotak fokus, status
            gate dan status tugasan datang dari pangkalan data — hanya berubah bila ditekan.
          </p>
          <p>
            Kerja yang sudah siap tetapi belum ditanda masih dikira belum. Supabase free plan pause
            selepas 7 hari tiada aktiviti; buka dashboard Supabase untuk hidupkan semula.
          </p>
        </div>

        <div className="foot-old" hidden>
          <span>{tracker.who.join(" · ") || "BagSense"} · BICS 4321 FYP1 · IIUM KICT</span>
          <span>
            mod: {tracker.mode} · dijana {tracker.generated.slice(0, 16).replace("T", " ")}
          </span>
        </div>
      </div>
    </>
  );
}
