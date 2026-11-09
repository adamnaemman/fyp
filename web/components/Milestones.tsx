import type { Milestone } from "@/lib/types";
import { fmtDate } from "@/lib/date";


function daysFromToday(date: string, today: string) {
  const a = Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10));
  const b = Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

export default function Milestones({
  milestones,
  today,
}: {
  milestones: Milestone[];
  today: string;
}) {
  const ordered = [...milestones].sort((a, b) => a.date.localeCompare(b.date));
  const next = ordered.find((m) => m.date >= today);

  return (
    <div className="panel">
      <div className="ph">
        <h3>Tarikh penting</h3>
        <span className="stamp">hari ini {today}</span>
      </div>
      <div className="pb">
        {ordered.length === 0 && <p className="secnote">Tiada tarikh direkod.</p>}
        {ordered.map((m) => {
          const d = daysFromToday(m.date, today);
          const note = d < 0 ? `${Math.abs(d)}h lalu` : d === 0 ? "hari ini" : `${d} hari`;
          const cls = d < 0 ? "past" : next?.id === m.id ? "next" : "";
          return (
            <div className={`ms ${cls}`} key={m.id}>
              <span className="d">{fmtDate(m.date)}</span>
              <span className="l">{m.label}</span>
              <span className={`n ${d >= 0 && d <= 7 ? "soon" : ""}`}>{note}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
