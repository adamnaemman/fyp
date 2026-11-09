import type { GateStatus, Week } from "@/lib/types";
import { fmtRange } from "@/lib/date";

const GATE_LABEL: Record<GateStatus, string> = {
  belum: "belum disahkan",
  lulus: "lulus",
  gagal: "tidak lulus",
};

export default function WeekCard({ week, canWrite }: { week: Week; canWrite: boolean }) {
  const ev = week.evidence;
  const evText = ev
    ? `Output ${ev.docs} dok · ${ev.code} kod${ev.report ? ` · Report ${ev.report}` : ""}`
    : "belum diselaraskan";

  return (
    <div className={`wk ${week.state} ${week.gate_status}`}>
      <div className="rail">
        <span className="dot" />
      </div>
      <div className="body">
        <div className="wkcard">
          <div className="wkhead">
            <h3>{week.label}</h3>
            <span className="rng">
              {fmtRange(week.start, week.end)}
            </span>
            {week.state === "kini" && <span className="tag kini">minggu ini</span>}
            {week.state === "lepas" && <span className="tag lepas">lepas</span>}
          </div>

          <p className="sem">{week.seminar || "tiada seminar"}</p>

          <div className="gate">
            <div className="gaterow">
              <span className="gk">Gate</span>
              <p>{week.gate}</p>
              <span className="ev">{evText}</span>
            </div>

            <div className="gateopts">
              <span className="lbl">status</span>
              {(["belum", "lulus", "gagal"] as GateStatus[]).map((s) =>
                canWrite ? (
                  <form key={s} method="post" action="/api/gate">
                    <input type="hidden" name="id" value={week.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      className={`gbtn ${s} ${week.gate_status === s ? "on" : ""}`}
                      title={`tanda gate ${GATE_LABEL[s]}`}
                    >
                      {s}
                    </button>
                  </form>
                ) : (
                  <span key={s} className={`gbtn ${s} ${week.gate_status === s ? "on" : ""}`}>
                    {s}
                  </span>
                ),
              )}
              {!canWrite && <span className="gnote">baca sahaja</span>}
            </div>

            {week.gate_note && <p className="gnote">{week.gate_note}</p>}
          </div>

          <ul className="focus">
            {week.focus.length === 0 && <li>tiada senarai fokus untuk minggu ini</li>}
            {week.focus.map((f) => (
              <li key={f.id} className={f.done ? "done" : ""}>
                <form method="post" action="/api/focus">
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="done" value={f.done ? "1" : "0"} />
                  <button
                    className="tick"
                    type="submit"
                    disabled={!canWrite}
                    title={canWrite ? (f.done ? "nyah tanda" : "tanda siap") : "baca sahaja"}
                    aria-label={f.done ? "nyah tanda siap" : "tanda siap"}
                  >
                    ✓
                  </button>
                </form>
                <span className="t">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
