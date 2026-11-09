import type { Stats } from "@/lib/data";

export default function StatCards({ s }: { s: Stats }) {
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
  return (
    <section className="stats">
      <div className="card">
        <div className="lbl">Minggu</div>
        <div className="val">
          {s.weeksPast}
          <small> / {s.weeksTotal} lepas</small>
        </div>
        <div className="sub2">lepas bila tarikh tamatnya sudah berlalu</div>
        <div className="bar">
          <i style={{ width: `${pct(s.weeksPast, s.weeksTotal)}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="lbl">Item fokus</div>
        <div className="val">
          {s.focusDone}
          <small> / {s.focusTotal} ditanda</small>
        </div>
        <div className="sub2">kotak yang ditanda oleh ahli projek</div>
        <div className="bar sky">
          <i style={{ width: `${pct(s.focusDone, s.focusTotal)}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="lbl">Tugasan</div>
        <div className="val">
          {s.tasksDone}
          <small> / {s.tasksTotal} siap</small>
        </div>
        <div className="sub2">
          {s.tasksBrief} masih brief · {s.tasksBlocked} berstatus sekat · {s.blocked} item tersekat
        </div>
        <div className="bar">
          <i style={{ width: `${pct(s.tasksDone, s.tasksTotal)}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="lbl">Bahan bukti</div>
        <div className="val">
          {s.docs}
          <small> dokumen/data</small>
        </div>
        <div className="sub2">
          {s.code} fail kod · {s.report} dalam Report/
        </div>
        <div className="bar amber">
          <i style={{ width: `${Math.min(100, s.docs * 2)}%` }} />
        </div>
      </div>
    </section>
  );
}
