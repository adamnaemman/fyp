import { computeStats, getTracker } from "@/lib/data";
import { getViewer } from "@/lib/auth";
import TopBar from "@/components/TopBar";
import { DOC_URL, REPO_URL } from "@/lib/links";
import { fmtDate } from "@/lib/date";

export const instant = false;

export const metadata = {
  title: "Panduan — BagSense FYP1",
};

/**
 * Satu halaman penerangan untuk penyelia dan Amru. Semua angka di sini dibaca
 * daripada data projek (snapshot fail / Supabase), bukan ditaip dalam teks.
 */
export default async function Panduan() {
  const [tracker, viewer] = await Promise.all([getTracker(), getViewer()]);
  const s = computeStats(tracker);

  return (
    <>
      <TopBar viewer={viewer} mode={tracker.mode} generated={tracker.generated} />

      <div className="wrap">
        <section className="pagehead">
          <p className="kicker">Panduan ringkas</p>
          <h1>
            Panduan <span>— untuk SV dan Amru</span>
          </h1>
          <p className="sub">
            Satu halaman sahaja. Tujuannya: sesiapa buka laman ini faham apa yang dia tengok, apa
            yang dia boleh buat, dan apa yang laman ini <b>tidak</b> tahu.
          </p>
        </section>

        <div className="guide">
          <section className="panel">
            <div className="ph">
              <h3>1 · Apa laman ini</h3>
              <span className="stamp">{fmtDate(tracker.generated.slice(0, 10))}</span>
            </div>
            <div className="pb" style={{ paddingTop: 12 }}>
              <p>
                Laman ini menunjukkan progres FYP1 BagSense: minggu mana sedang berjalan, gate
                (syarat) setiap minggu, senarai tugasan, tarikh penting, dan bahan bukti yang sudah
                ada dalam folder projek.
              </p>
              <p>
                <b>Angka tidak ditaip.</b> Bilangan dokumen, fail kod dan draf laporan dikira oleh
                skrip <code>tracker/export_snapshot.py</code> yang membaca folder{" "}
                <code>Week*/Output</code> dan <code>Report/</code> pada laptop Adam, kemudian
                dihantar ke pangkalan data. Status gate dan status tugasan berbeza: ia <b>ditanda
                oleh manusia</b>, bukan dikira dari bilangan fail.
              </p>
              <div className="gstat">
                <div>
                  <b>
                    {s.weeksPast}/{s.weeksTotal}
                  </b>
                  <span>minggu sudah lepas</span>
                </div>
                <div>
                  <b>
                    {s.focusDone}/{s.focusTotal}
                  </b>
                  <span>item fokus ditanda</span>
                </div>
                <div>
                  <b>
                    {s.tasksDone}/{s.tasksTotal}
                  </b>
                  <span>tugasan siap</span>
                </div>
                <div>
                  <b>{s.docs}</b>
                  <span>dokumen/data</span>
                </div>
                <div>
                  <b>{s.report}</b>
                  <span>draf dalam Report/</span>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <h3>2 · Tiga peranan</h3>
              <span className="stamp">siapa boleh buat apa</span>
            </div>
            <div className="pb" style={{ paddingTop: 12 }}>
              <div className="tblwrap">
                <table className="rolex">
                  <thead>
                    <tr>
                      <th>Peranan</th>
                      <th>Siapa</th>
                      <th>Boleh buat</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>admin</td>
                      <td>Adam</td>
                      <td>Tulis semua: tanda fokus, status gate, status tugasan, tambah/ubah/padam batch dan tugasan.</td>
                    </tr>
                    <tr>
                      <td>member</td>
                      <td>Amru</td>
                      <td>Sama seperti admin untuk kerja harian (tanda dan urus tugasan).</td>
                    </tr>
                    <tr>
                      <td>viewer</td>
                      <td>Penyelia (SV)</td>
                      <td>Baca sahaja. Tidak perlu log masuk pun boleh baca semua halaman.</td>
                    </tr>
                    <tr>
                      <td>tetamu</td>
                      <td>Sesiapa yang buka pautan</td>
                      <td>Baca sahaja, tiada butang tulis.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: 10 }}>
                Peranan ditentukan oleh emel dalam jadual <code>members</code>. Kalau emel anda
                belum ada dalam jadual itu, anda akan dilihat sebagai <b>viewer</b> walaupun sudah
                log masuk.
              </p>
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <h3>3 · Log masuk</h3>
              <span className="stamp">pilihan, bukan wajib</span>
            </div>
            <div className="pb" style={{ paddingTop: 12 }}>
              <ol>
                <li>
                  Klik <b>log masuk</b> di bar atas. Halaman <code>/login</code> akan bertanya emel.
                </li>
                <li>
                  Supabase (pangkalan data dalam talian yang menyimpan data laman ini) menghantar
                  pautan sekali guna ke emel itu. Klik pautan tersebut — anda sudah log masuk.
                </li>
                <li>
                  Kalau emel tidak sampai (had penghantaran emel Supabase memang terhad), buka{" "}
                  <code>/login?mode=password</code> dan guna emel + kata laluan akaun anda.
                </li>
              </ol>
              <p>
                <b>Sebelum log masuk:</b> semua senarai nampak, tiada butang tulis.{" "}
                <b>Selepas log masuk sebagai admin/member:</b> butang tulis muncul (tanda fokus,
                status gate, status tugasan, borang batch/tugasan, butang padam). Butang{" "}
                <b>keluar</b> ada di bar atas.
              </p>
              <p>
                Kalau anda menghantar borang walaupun tiada kebenaran, pelayan menolak dan memaparkan
                mesej — bukan gagal senyap.
              </p>
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <h3>4 · Tambah batch, tambah tugasan, set tarikh</h3>
              <span className="stamp">halaman Tugasan</span>
            </div>
            <div className="pb" style={{ paddingTop: 12 }}>
              <h4>Batch</h4>
              <ol>
                <li>
                  Buka menu <b>Tugasan</b>, isi kad <b>Tambah batch</b>: no batch, label, tarikh
                  (boleh kosong), nota (boleh kosong).
                </li>
                <li>
                  Untuk ubah, buka <b>Ubah batch</b> di dalam kad batch itu. Untuk padam, tekan{" "}
                  <b>Padam batch</b> — klik pertama hanya bertanya, klik kedua baru padam. Tugasan
                  di dalamnya tidak dipadam; ia jadi “tanpa batch”.
                </li>
              </ol>
              <h4>Tugasan</h4>
              <ol>
                <li>
                  Dalam kad batch, buka <b>Tambah tugasan dalam kumpulan ini</b>: tulis tugasan,
                  pilih batch, pilih status, isi tarikh mula/tamat (boleh kosong).
                </li>
                <li>
                  Untuk ubah tugasan sedia ada, klik nama tugasan — panel butiran terbuka dan
                  borang yang sama membolehkan tukar status, tarikh, batch, atau padam (dua langkah).
                </li>
                <li>
                  <b>Tanda siap:</b> dalam panel butiran, tukar status kepada <b>siap</b>. Di laman
                  Progres, lencana status juga boleh diklik untuk pusing status (brief → jalan →
                  semak → siap).
                </li>
              </ol>
              <p>
                <b>Gantt</b> melukis bar daripada tarikh mula/tamat setiap tugasan. <b>Kalendar</b>
                menunjukkan tarikh mula dan tamat pada hari yang betul. Dua-dua halaman membaca
                medan yang sama — tiada tarikh disalin atau dianggar di antara mereka.
              </p>
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <h3>5 · Maksud status dan warna</h3>
              <span className="stamp">status ialah pilihan manusia</span>
            </div>
            <div className="pb" style={{ paddingTop: 12 }}>
              <div className="legend" style={{ marginBottom: 10 }}>
                <span>
                  <i className="sw brief" /> brief
                </span>
                <span>
                  <i className="sw jalan" /> jalan
                </span>
                <span>
                  <i className="sw semak" /> semak
                </span>
                <span>
                  <i className="sw siap" /> siap
                </span>
                <span>
                  <i className="sw sekat" /> sekat
                </span>
              </div>
              <ul>
                <li>
                  <b>brief</b> — kerja sudah dicatat, belum bermula (kelabu).
                </li>
                <li>
                  <b>jalan</b> — sedang dibuat (kuning).
                </li>
                <li>
                  <b>semak</b> — kerja siap tetapi belum disemak/dibuktikan (biru).
                </li>
                <li>
                  <b>siap</b> — sudah selesai (hijau).
                </li>
                <li>
                  <b>sekat</b> — tersekat, tunggu sesuatu (merah). Sebabnya ditulis dalam butiran.
                </li>
              </ul>
              <p>
                Status gate setiap minggu pula ada tiga: <b>belum</b>, <b>lulus</b>, <b>gagal</b>.
                Gate ialah syarat yang boleh diuji sendiri (contoh: ujian bacaan tag berjaya).
              </p>
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <h3>6 · “Belum dijadualkan” dan gate yang tidak automatik</h3>
            </div>
            <div className="pb" style={{ paddingTop: 12 }}>
              <p>
                <b>Belum dijadualkan</b> bermaksud tugasan itu tiada tarikh mula dan tiada tarikh
                tamat. Ia tidak dilukis dalam Gantt dan tidak muncul dalam Kalendar, tetapi ia
                tetap dikira dalam jumlah tugasan dan disenaraikan dalam panel “Belum
                dijadualkan”. Ini keadaan yang sah — merancang kemudian lebih baik daripada meneka
                tarikh.
              </p>
              <p>
                <b>Gate tidak ditanda automatik.</b> Walaupun folder Output penuh dengan fail, gate
                kekal <b>belum</b> sehingga ada manusia menekan <b>lulus</b> atau <b>gagal</b>. Fail
                yang banyak bukan bukti lulus: bukti ialah ujian yang dijalankan dan dicatat. Sebab
                itu laman ini tidak mempunyai lencana “gate lulus” automatik.
              </p>
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <h3>7 · Had yang kami akui</h3>
            </div>
            <div className="pb" style={{ paddingTop: 12 }}>
              <ul>
                <li>Tarikh kosong bermaksud <b>belum dirancang</b> — bukan hari ini, bukan tarikh batch.</li>
                <li>Tiada lencana “gate lulus” automatik; gate hanya berubah bila ditekan manusia.</li>
                <li>
                  Kiraan fail bukti dikira pada laptop Adam. Kalau laman ini dibuka di tempat lain,
                  angka itu yang terakhir dihantar, bukan bacaan langsung dari cakera.
                </li>
                <li>
                  Pangkalan data percuma Supabase akan “pause” selepas 7 hari tiada aktiviti; buka
                  dashboard Supabase untuk hidupkan semula.
                </li>
                <li>
                  Memadam batch tidak memadam tugasan. Memadam tugasan tidak boleh dibatalkan.
                </li>
              </ul>
              <p style={{ marginTop: 10 }}>
                Pautan luar:{" "}
                <a href={DOC_URL} target="_blank" rel="noopener noreferrer">
                  Laporan (Google Docs) ↗
                </a>{" "}
                ·{" "}
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  Repo GitHub ↗
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
