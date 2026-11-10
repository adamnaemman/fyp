import { getBom } from "@/lib/data";
import { getViewer } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/supabase/server";
import { klStamp } from "@/lib/date";
import TopBar from "@/components/TopBar";
import { deleteBom, saveBom, setBomStatus } from "@/lib/bom-actions";
import type { BomItem } from "@/lib/types";

export const instant = false;

const NEXT: Record<BomItem["status"], BomItem["status"]> = {
  belum: "order",
  order: "sampai",
  sampai: "belum",
  batal: "belum",
};

const LABEL: Record<BomItem["status"], string> = {
  belum: "belum beli",
  order: "dah order",
  sampai: "dah sampai",
  batal: "batal",
};

const rm = (n: number) =>
  `RM ${n.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Fields({ item }: { item?: BomItem }) {
  return (
    <>
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="ord" value={item?.ord ?? 0} />
      <label className="f-wide">
        <span>Komponen</span>
        <input name="name" required defaultValue={item?.name ?? ""} placeholder="Contoh: Modul UHF YRM100" />
      </label>
      <label className="f-wide">
        <span>Spesifikasi penting</span>
        <input name="spec" defaultValue={item?.spec ?? ""} placeholder="Contoh: 919–923 MHz, 5 V" />
      </label>
      <label>
        <span>Kuantiti</span>
        <input name="qty" type="number" min="1" step="1" defaultValue={item?.qty ?? 1} />
      </label>
      <label>
        <span>Harga seunit (RM)</span>
        <input name="unit_price" inputMode="decimal" defaultValue={item?.unit_price ?? ""} placeholder="0.00" />
      </label>
      <label>
        <span>Status</span>
        <select name="status" defaultValue={item?.status ?? "belum"}>
          <option value="belum">belum beli</option>
          <option value="order">dah order</option>
          <option value="sampai">dah sampai</option>
          <option value="batal">batal</option>
        </select>
      </label>
      <label>
        <span>Pembekal</span>
        <input name="seller" defaultValue={item?.seller ?? ""} placeholder="Shopee / Cytron / lab" />
      </label>
      <label className="f-wide">
        <span>Pautan</span>
        <input name="url" type="url" defaultValue={item?.url ?? ""} placeholder="https://..." />
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
  const [items, viewer] = await Promise.all([getBom(), getViewer()]);
  const canWrite = Boolean(viewer?.canWrite);

  const total = items.reduce((n, i) => n + (i.unit_price ?? 0) * i.qty, 0);
  const counted = (s: BomItem["status"]) => items.filter((i) => i.status === s).length;
  const arrived = items.filter((i) => i.status === "sampai");
  const spent = arrived.reduce((n, i) => n + (i.unit_price ?? 0) * i.qty, 0);

  return (
    <>
      <TopBar viewer={viewer} mode={supabaseConfigured ? "supabase" : "snapshot"} generated={klStamp()} />
      <div className="wrap">
        {sp.err && <div className="banner err">{sp.err}</div>}
        {sp.ok && <div className="banner ok">{sp.ok}</div>}

        <h2 className="sec">Pembelian komponen</h2>
        <p className="secnote">
          Senarai beli untuk prototaip BagSense. Harga ialah anggaran dari pelan induk sehingga kau
          masukkan harga sebenar yang dibayar. Klik tanda status untuk tukar (belum → order → sampai).
        </p>

        <section className="stats" style={{ marginBottom: 14 }}>
          <div className="card">
            <div className="lbl">Anggaran jumlah</div>
            <div className="val">{rm(total)}</div>
            <div className="sub2">
              {items.length} komponen · {counted("belum")} belum beli
            </div>
          </div>
          <div className="card">
            <div className="lbl">Dah dibelanjakan</div>
            <div className="val">{rm(spent)}</div>
            <div className="sub2">{arrived.length} komponen dah sampai</div>
          </div>
          <div className="card">
            <div className="lbl">Dalam perjalanan</div>
            <div className="val">{counted("order")}</div>
            <div className="sub2">sudah dipesan, belum sampai</div>
          </div>
        </section>

        <div className="panel">
          <div className="ph">
            <h3>Senarai</h3>
            <span className="stamp">{items.length} baris</span>
          </div>
          <div className="pb">
            {items.length === 0 && (
              <p className="secnote" style={{ padding: "12px 0" }}>
                Tiada baris lagi. Jalankan migrasi <code>web/supabase/migrations/2026-11-10_bom.sql</code>{" "}
                untuk mula dengan senarai dari pelan induk, atau tambah sendiri di bawah.
              </p>
            )}

            {items.map((it) => (
              <details className="item" key={it.id}>
                <summary>
                  <b>{it.name}</b>
                  <span className="it-cat">{it.qty}×</span>
                  <span className="it-qty">{it.unit_price != null ? rm(it.unit_price * it.qty) : "harga belum"}</span>
                  <span className={`it-tag ${it.status === "sampai" ? "on" : ""}`}>{LABEL[it.status]}</span>
                </summary>

                {it.spec && <p className="secnote" style={{ margin: "0 0 8px" }}>{it.spec}</p>}
                {it.note && <p className="secnote" style={{ margin: "0 0 8px" }}>Nota: {it.note}</p>}
                {it.seller && (
                  <p className="secnote" style={{ margin: "0 0 8px" }}>
                    Pembekal: {it.seller}
                    {it.url ? (
                      <>
                        {" · "}
                        <a href={it.url} target="_blank" rel="noopener noreferrer">
                          pautan
                        </a>
                      </>
                    ) : null}
                  </p>
                )}

                {canWrite ? (
                  <>
                    <form action={setBomStatus} className="item-del">
                      <input type="hidden" name="id" value={it.id} />
                      <input type="hidden" name="status" value={NEXT[it.status]} />
                      <button className="btn" type="submit">
                        Tukar status → {LABEL[NEXT[it.status]]}
                      </button>
                    </form>

                    <form className="tform" action={saveBom}>
                      <Fields item={it} />
                      <button className="go" type="submit">
                        Simpan perubahan
                      </button>
                    </form>

                    <form action={deleteBom} className="item-del">
                      <input type="hidden" name="id" value={it.id} />
                      <button className="btn danger" type="submit">
                        Padam baris
                      </button>
                    </form>
                  </>
                ) : null}
              </details>
            ))}
          </div>
        </div>

        {canWrite ? (
          <div className="panel" style={{ marginTop: 14 }}>
            <div className="ph">
              <h3>Tambah komponen</h3>
            </div>
            <div className="pb">
              <form className="tform" action={saveBom}>
                <Fields />
                <button className="go" type="submit">
                  Tambah
                </button>
              </form>
            </div>
          </div>
        ) : (
          <p className="secnote" style={{ marginTop: 14 }}>
            Log masuk sebagai ahli untuk tambah atau kemas kini senarai beli.
          </p>
        )}
      </div>
    </>
  );
}
