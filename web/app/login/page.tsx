import Link from "next/link";


// Halaman ini baca cookie sesi + pangkalan data pada setiap permintaan.
// Next 16 (cacheComponents) mahu prerender; tracker mesti segar, jadi blocking dibenarkan.
export const instant = false;

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; err?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="wrap">
      <div className="box">
        <h1>Log masuk</h1>
        <p>
          Masukkan emel yang didaftarkan dalam jadual <code>members</code> Supabase. Kami hantar
          pautan sekali guna — tiada kata laluan untuk dicuri atau dilupakan.
        </p>

        {sp.sent && (
          <div className="banner ok" style={{ margin: "0 0 14px" }}>
            Pautan dihantar. Semak emel (dan folder spam). Pautan luput selepas sejam.
          </div>
        )}
        {sp.err && (
          <div className="banner err" style={{ margin: "0 0 14px" }}>
            {sp.err}
          </div>
        )}

        <form method="post" action="/api/auth/login">
          <label htmlFor="email">Emel</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@iium.edu.my"
          />
          <button className="go" type="submit">
            Hantar pautan log masuk
          </button>
        </form>

        <p className="fine">
          <Link href="/">← kembali ke tracker</Link>
        </p>
      </div>
    </div>
  );
}
