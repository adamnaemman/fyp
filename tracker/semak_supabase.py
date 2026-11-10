"""Semak sambungan Supabase — satu jawapan, tiada istilah teknikal.

    python tracker/semak_supabase.py

Baca SUPABASE_URL + SUPABASE_SERVICE_KEY (atau SUPABASE_SECRET_KEY) dari env,
kemudian cetak SAMA ADA data projek sudah ada dalam pangkalan data.

Keluar 0 kalau sambung + data lengkap, 1 kalau tidak.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

EXPECT = {"weeks": 11, "focus_items": 40, "tasks": 12, "milestones": 7}


def check_url(url: str):
    """Sekat URL contoh / salah bentuk sebelum buang masa dengan DNS."""
    u = (url or "").strip().rstrip("/")
    if not u.startswith("https://"):
        return "URL mesti mula dengan https://"
    if ".supabase.co" not in u:
        return "URL mesti berakhir dengan .supabase.co"
    if any(x in u.lower() for x in ("xxxx", "abcdefgh", "project-ref", "ganti")):
        return "URL tu masih CONTOH, bukan projek kau. Ambil dari dashboard: Settings - API - Project URL"
    if "/rest/" in u or "/dashboard/" in u:
        return "ambil Project URL sahaja (https://<ref>.supabase.co), jangan endpoint atau URL dashboard"
    return None


def get(url: str, key: str, path: str):
    req = urllib.request.Request(
        f"{url}/rest/v1/{path}",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Prefer": "count=exact",
            "Range": "0-0",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        cr = r.headers.get("Content-Range", "")
        rows = json.loads(r.read().decode("utf-8") or "[]")
        total = cr.split("/")[-1] if "/" in cr else str(len(rows))
        return total


def main() -> int:
    url = (os.environ.get("SUPABASE_URL") or "").rstrip("/")
    key = (os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SECRET_KEY")
           or os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "")

    if not url or not key:
        print("TAK SAMBUNG: SUPABASE_URL / SUPABASE_SERVICE_KEY tiada dalam env.")
        return 1
    bad = check_url(url)
    if bad:
        print(f"TAK SAMBUNG: {bad}")
        return 1

    print(f"projek: {url}")
    counts, errors = {}, {}
    for table, expect in EXPECT.items():
        try:
            counts[table] = get(url, key, f"{table}?select=id")
        except urllib.error.HTTPError as e:
            errors[table] = f"HTTP {e.code}: {e.read()[:180].decode('utf-8', 'replace')}"
        except Exception as e:  # noqa: BLE001
            errors[table] = str(e)

    if errors:
        print("\nTAK SAMBUNG / BELUM SIAP:")
        for t, e in errors.items():
            print(f"  {t}: {e}")
        if any("Could not find the table" in e for e in errors.values()):
            print("  → jalankan web/supabase/schema.sql dalam SQL Editor dulu.")
        elif any("401" in e for e in errors.values()):
            print("  → kunci salah. Ambil semula dari Settings → API Keys (secret).")
        return 1

    empty = [t for t in EXPECT if counts.get(t) in ("0", "None", None)]
    print("\nSAMBUNG ✓  (" + ", ".join(f"{t}={counts[t]}" for t in EXPECT) + ")")

    if empty:
        print(f"\nTAPI masih kosong: {', '.join(empty)}")
        print("  → jalankan: python tracker/export_snapshot.py --push")
        return 1

    short = [f"{t}: ada {counts[t]}, jangka {EXPECT[t]}" for t in EXPECT
             if str(counts[t]).isdigit() and int(counts[t]) != EXPECT[t]]
    if short:
        print("\nData ada, tetapi bilangan tak sama dengan fail projek:")
        for s in short:
            print("  -", s)
        print("  → jana semula: python tracker/export_snapshot.py --push")

    print("\nSIAP. Buka site, lencana atas kiri patut tulis SUPABASE (hijau).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
