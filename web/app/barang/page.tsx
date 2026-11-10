import { getItems } from "@/lib/data";
import { supabaseConfigured } from "@/lib/supabase/server";
import { klStamp } from "@/lib/date";
import { getViewer } from "@/lib/auth";
import TopBar from "@/components/TopBar";
import { deleteItem, saveItem } from "@/lib/item-actions";
import type { Item } from "@/lib/types";

export const instant = false;

function Fields({ item }: { item?: Item }) {
  return (
    <>
      {item && <input type="hidden" name="id" value={item.id} />}
      <label className="f-wide">
        <span>Nama barang</span>
        <input name="name" required defaultValue={item?.name ?? ""} placeholder="Contoh: Laptop" />
      </label>
      <label>
        <span>Kategori</span>
        <input name="category" defaultValue={item?.category ?? ""} placeholder="elektronik / buku" />
      </label>
      <label>
        <span>Kuantiti</span>
        <input name="qty" type="number" min="1" step="1" defaultValue={item?.qty ?? 1} />
      </label>
      <label>
        <span>Tag UHF (EPC)</span>
        <input name="tag_epc" defaultValue={item?.tag_epc ?? ""} placeholder="kosong = belum ditag" />
      </label>
      <label>
        <span>Poket / kompartmen</span>
        <input name="baggage" defaultValue={item?.baggage ?? "utama"} />
      </label>
      <label className="f-wide">
        <span>Nota</span>
        <input name="note" defaultValue={item?.note ?? ""} placeholder="pilihan" />
      </label>
    </>
  );
}

export default async function Barang({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const [items, viewer] = await Promise.all([getItems(), getViewer()]);
  const canWrite = Boolean(viewer?.canWrite);

  return (
    <>
      <TopBar viewer={viewer} mode={supabaseConfigured ? "supabase" : "snapshot"} generated={klStamp()} />
      <div className="wrap">
        {sp.err && <div className="banner err">{sp.err}</div>}
        {sp.ok && <div className="banner ok">{sp.ok}</div>}

        <h2 className="sec">Barang</h2>
        <p className="secnote">
          Senarai barang yang dipilih untuk beg. Klik satu baris untuk sunting atau padam. Tag UHF
          diletakkan bila tag fizikal ditampal — kosong bermakna belum ditag, bukan tiada barang.
        </p>

        <div className="panel">
          <div className="ph">
            <h3>Senarai ({items.length})</h3>
            <span className="stamp">{items.filter((i) => i.tag_epc).length} bertag</span>
          </div>
          <div className="pb">
            {items.length === 0 && (
              <p className="secnote" style={{ padding: "12px 0" }}>
                Tiada barang lagi. Tambah yang pertama di bawah — atau jalankan migrasi{" "}
                <code>web/supabase/migrations/2026-11-10_items.sql</code> kalau jadual belum wujud.
              </p>
            )}

            {items.map((it) => (
              <details className="item" key={it.id}>
                <summary>
                  <b>{it.name}</b>
                  <span className="it-cat">{it.category ?? "tanpa kategori"}</span>
                  <span className="it-qty">×{it.qty}</span>
                  <span className={`it-tag ${it.tag_epc ? "on" : ""}`}>
                    {it.tag_epc ? "bertag" : "belum ditag"}
                  </span>
                </summary>

                {canWrite ? (
                  <>
                    <form className="tform" action={saveItem}>
                      <Fields item={it} />
                      <button className="go" type="submit">
                        Simpan perubahan
                      </button>
                    </form>
                    <form action={deleteItem} className="item-del">
                      <input type="hidden" name="id" value={it.id} />
                      <button className="btn danger" type="submit">
                        Padam barang
                      </button>
                    </form>
                  </>
                ) : (
                  <dl className="kv" style={{ marginTop: 8 }}>
                    <dt>Tag</dt>
                    <dd>{it.tag_epc ?? "belum ditag"}</dd>
                    <dt>Poket</dt>
                    <dd>{it.baggage ?? "utama"}</dd>
                    <dt>Nota</dt>
                    <dd>{it.note ?? "—"}</dd>
                  </dl>
                )}
              </details>
            ))}
          </div>
        </div>

        {canWrite ? (
          <div className="panel" style={{ marginTop: 14 }}>
            <div className="ph">
              <h3>Tambah barang</h3>
            </div>
            <div className="pb">
              <form className="tform" action={saveItem}>
                <Fields />
                <button className="go" type="submit">
                  Tambah barang
                </button>
              </form>
            </div>
          </div>
        ) : (
          <p className="secnote" style={{ marginTop: 14 }}>
            Log masuk sebagai ahli untuk tambah atau sunting barang.
          </p>
        )}
      </div>
    </>
  );
}
