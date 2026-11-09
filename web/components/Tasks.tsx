import type { Task, TaskStatus } from "@/lib/types";

const NEXT: Record<TaskStatus, TaskStatus> = {
  brief: "jalan",
  jalan: "semak",
  semak: "siap",
  siap: "brief",
  sekat: "jalan",
};

function groupTasks(tasks: Task[]) {
  const map = new Map<number, { note: string; date: string | null; rows: Task[] }>();
  for (const t of tasks) {
    const g = map.get(t.batch_no) ?? { note: t.batch_note ?? "", date: t.batch_date, rows: [] };
    g.rows.push(t);
    map.set(t.batch_no, g);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

export default function Tasks({
  tasks,
  canWrite,
  done,
  total,
}: {
  tasks: Task[];
  canWrite: boolean;
  done: number;
  total: number;
}) {
  return (
    <div className="panel">
      <div className="ph">
        <h3>Tugasan ikut batch</h3>
        <span className="stamp">
          {done} siap / {total}
        </span>
      </div>
      <div className="pb">
        {tasks.length === 0 && <p className="secnote" style={{ padding: "10px 0" }}>Tiada tugasan.</p>}
        {groupTasks(tasks).map(([no, g]) => (
          <div key={no}>
            <div className="batch">
              <b>Batch {no}</b>
              {g.date ? ` · ${g.date}` : " · tarikh belum ditetapkan"}
              {g.note ? ` · ${g.note}` : ""}
            </div>
            {g.rows.map((t) => (
              <div className="task" key={t.id}>
                <span className="id">{t.id}</span>
                <span className="t">
                  {t.task}
                  <em>
                    {t.role}
                    {t.detail ? ` · ${t.detail.slice(0, 130)}` : ""}
                  </em>
                </span>
                {canWrite ? (
                  <form method="post" action="/api/task">
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="status" value={NEXT[t.status]} />
                    <button
                      className={`st ${t.status}`}
                      type="submit"
                      title={`klik → ${NEXT[t.status]}`}
                    >
                      {t.status}
                    </button>
                  </form>
                ) : (
                  <span className={`st ${t.status}`}>{t.status}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
