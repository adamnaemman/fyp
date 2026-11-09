import type { BlockedItem } from "@/lib/types";

export default function Blocked({
  items,
  canWrite,
}: {
  items: BlockedItem[];
  canWrite: boolean;
}) {
  const open = items.filter((b) => !b.resolved);
  return (
    <div className="panel" style={{ marginTop: 14 }}>
      <div className="ph">
        <h3>Tersekat — perlu Adam</h3>
        <span className="stamp">{open.length} terbuka</span>
      </div>
      <div className="pb">
        {items.length === 0 && <p className="secnote">Tiada item tersekat direkod.</p>}
        {items.map((b) => (
          <div className="blk" key={b.id}>
            <b className={b.resolved ? "done" : ""}>{b.what}</b>
            <span>{b.why}</span>
            {!b.resolved && canWrite && (
              <form method="post" action="/api/blocked">
                <input type="hidden" name="id" value={b.id} />
                <button className="gbtn" type="submit">
                  tanda selesai
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
