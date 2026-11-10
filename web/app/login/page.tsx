import Link from "next/link";

// Halaman ini baca cookie sesi + pangkalan data pada setiap permintaan.
// Next 16 (cacheComponents) mahu prerender; tracker mesti segar, jadi blocking dibenarkan.
export const instant = false;

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; err?: string; mode?: string }>;
}) {
  const sp = await searchParams;
  const passwordMode = sp.mode === "password";

  return (
    <div className="wrap">
      <div className="box">
        <h1>Log masuk</h1>

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

        {passwordMode ? (
          <>
            <p>
              Masukkan kata laluan akaun Supabase Auth kau. Ini tidak menghantar emel, jadi had
              emel Supabase tidak menghalang.
            </p>
            <form method="post" action="/api/auth/password">
              <label htmlFor="email">Emel</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@iium.edu.my"
              />
              <label htmlFor="password" style={{ marginTop: 12 }}>
                Kata laluan
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button className="go" type="submit">
                Log masuk
              </button>
            </form>
            <p className="fine">
              <Link href="/login">Guna pautan emel</Link> · <Link href="/">← tracker</Link>
            </p>
          </>
        ) : (
          <>
            <p>
              Masukkan emel yang didaftarkan dalam jadual <code>members</code> Supabase. Kami hantar
              pautan sekali guna — tiada kata laluan untuk dicuri atau dilupakan.
            </p>
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
              Emel tak sampai (had Supabase ~2 sejam)?{" "}
              <Link href="/login?mode=password">Guna kata laluan</Link> · <Link href="/">← tracker</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
