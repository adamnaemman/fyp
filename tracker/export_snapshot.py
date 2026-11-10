#!/usr/bin/env python
"""Jana web/data/snapshot.json dari fail projek, dan (pilihan) tolak ke Supabase.

    python tracker/export_snapshot.py            # tulis snapshot sahaja
    python tracker/export_snapshot.py --push     # tulis snapshot + upsert ke Supabase

Snapshot ialah fallback baca-sahaja untuk app Next.js: kalau env var Supabase tiada
atau rangkaian gagal, halaman masih memaparkan data fail projek yang sebenar.

Tolak ke Supabase perlukan dua env var (JANGAN commit nilainya):

    SUPABASE_URL=https://xxxx.supabase.co
    SUPABASE_SERVICE_KEY=<service_role key>

Kunci service_role melangkau RLS — ia hanya digunakan di sini, pada mesin Adam,
tidak pernah dihantar ke pelayar.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_tracker as bt  # noqa: E402

ROOT = bt.ROOT
OUT = os.path.join(ROOT, "web", "data", "snapshot.json")


def iso(d):
    return d.isoformat() if isinstance(d, date) else None


def slug(text: str, n: int = 18) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:n].strip("-") or "x"


def focus_id(week_id: str, text: str) -> str:
    """ID stabil ikut teks, bukan ikut urutan — susun semula README tak hilangkan tanda."""
    return f"{week_id}-{hashlib.sha1(text.encode('utf-8')).hexdigest()[:8]}"


def build_snapshot() -> dict:
    data = bt.collect()
    weeks = []
    for idx, w in enumerate(data["weeks"]):
        weeks.append({
            "id": w["folder"],
            "sort": idx,
            "num": w["num"],
            "suffix": w["suffix"],
            "label": w["label"],
            "start": iso(w["start"]),
            "end": iso(w["end"]),
            "seminar": w["seminar"],
            "gate": w["gate"],
            "gate_status": "belum",          # status gate = keputusan manusia, bukan derivasi
            "gate_note": None,
            "focus": [
                {"id": focus_id(w["folder"], f["text"]), "ord": i,
                 "text": f["text"], "done": bool(f["done"])}
                for i, f in enumerate(w["focus"])
            ],
            "evidence": {
                "docs": w["out_n"], "code": w["out_code"], "report": w["rep_n"],
                "synced_at": date.today().isoformat(),
            },
        })

    tasks = []
    for b in data["batches"]:
        for r in b["rows"]:
            tasks.append({
                "id": r["id"],
                "batch_no": b["no"],
                "batch_date": b["date"] if re.match(r"^\d{4}-\d{2}-\d{2}$", b["date"] or "") else None,
                "batch_note": b["note"],
                "role": r["role"],
                "task": r["task"],
                "status": r["status"] if r["status"] in
                          ("brief", "jalan", "semak", "siap", "sekat") else "brief",
                "detail": r["detail"],
            })

    milestones = [
        {"id": f"ms-{slug(m['label'])}", "label": m["label"],
         "date": m["date"].isoformat(), "ord": i}
        for i, m in enumerate(sorted(data["milestones"], key=lambda x: x["date"]))
    ]

    blocked = [
        {"id": f"blk-{slug(b['what'])}", "what": b["what"], "why": b["why"],
         "resolved": False, "ord": i}
        for i, b in enumerate(data["blocked"])
    ]

    specs = [{"key": s["k"], "value": s["v"], "ord": i} for i, s in enumerate(data["specs"])]
    plans = [{"name": p["name"], "text": p["text"], "ord": i} for i, p in enumerate(data["plans"])]

    return {
        "generated": data["generated"],
        "who": [x.split(":", 1)[1].strip().rstrip(".") for x in data["who"]
                if x.startswith(("Adam:", "Rakan:"))],
        "weeks": weeks,
        "tasks": tasks,
        "milestones": milestones,
        "blocked": blocked,
        "specs": specs,
        "plans": plans,
    }


XOR = {
    "weeks": "id",
    "focus_items": "id",
    "evidence": "week_id",
    "tasks": "id",
    "milestones": "id",
    "blocked": "id",
    "specs": "key",
    "plans": "name",
}


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


def post(url: str, key: str, table: str, rows: list[dict], on_conflict: str):
    req = urllib.request.Request(
        f"{url}/rest/v1/{table}?on_conflict={on_conflict}",
        data=json.dumps(rows).encode("utf-8"),
        method="POST",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.status


def delete(url: str, key: str, table: str, query: str):
    req = urllib.request.Request(
        f"{url}/rest/v1/{table}?{query}",
        method="DELETE",
        headers={"apikey": key, "Authorization": f"Bearer {key}"},
    )
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.status


def push(snap: dict, dry: bool = False) -> int:
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_KEY", "")
    if not (url and key):
        print("RALAT: set SUPABASE_URL dan SUPABASE_SERVICE_KEY dulu.")
        print("       (export di shell, jangan tulis dalam fail yang masuk git)")
        return 2
    bad = check_url(url)
    if bad:
        print(f"RALAT URL: {bad}")
        return 2

    weeks = [{k: v for k, v in w.items() if k not in ("focus", "evidence")} for w in snap["weeks"]]
    focus = [dict(f, week_id=w["id"]) for w in snap["weeks"] for f in w["focus"]]
    evidence = [dict(e, week_id=w["id"]) for w in snap["weeks"] if (e := w["evidence"])]
    # status gate milik manusia: jangan hantar semula masa sync
    for w in weeks:
        w.pop("gate_status", None)
        w.pop("gate_note", None)
    for t in snap["tasks"]:
        t.pop("status", None)  # sama untuk status tugasan

    payloads = {
        "weeks": weeks,
        "focus_items": focus,
        "evidence": evidence,
        "tasks": snap["tasks"],
        "milestones": snap["milestones"],
        "blocked": snap["blocked"],
        "specs": snap["specs"],
        "plans": snap["plans"],
    }

    if dry:
        for t, rows in payloads.items():
            print(f"[dry-run] {t}: {len(rows)} baris → contoh {json.dumps(rows[0], ensure_ascii=False)[:150] if rows else '-'}")
        return 0

    rc = 0
    for table, rows in payloads.items():
        if not rows:
            continue
        try:
            st = post(url, key, table, rows, XOR[table])
            print(f"  {table}: {len(rows)} baris → HTTP {st}")
        except urllib.error.HTTPError as e:
            print(f"  {table}: GAGAL {e.code} {e.read()[:300]!r}")
            rc = 1
        except Exception as e:  # noqa: BLE001
            print(f"  {table}: GAGAL {e}")
            rc = 1

    # buang item fokus yang dah tiada dalam README (derivasi, bukan tulisan manusia)
    week_ids = [w["id"] for w in snap["weeks"]]
    keep = ",".join(f["id"] for f in focus if f["id"] not in ("", ","))
    if week_ids:
        try:
            q = f"week_id=in.({','.join(week_ids)})"
            if keep:
                q += f"&id=not.in.({keep})"
            delete(url, key, "focus_items", q)
            print("  focus_items: item usang dibuang")
        except Exception as e:  # noqa: BLE001
            print(f"  focus_items prune: {e}")
    return rc


def main():
    ap = argparse.ArgumentParser(description="Jana snapshot JSON untuk app web (dan tolak ke Supabase).")
    ap.add_argument("--push", action="store_true", help="upsert ke Supabase selepas tulis snapshot")
    ap.add_argument("--dry-run", action="store_true", help="tunjuk payload tanpa hantar")
    ap.add_argument("--out", default=OUT)
    a = ap.parse_args()

    snap = build_snapshot()
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(snap, fh, ensure_ascii=False, indent=1)
    print(f"ditulis {a.out}")
    n_w = len(snap["weeks"])
    n_f = sum(len(w["focus"]) for w in snap["weeks"])
    n_t = len(snap["tasks"])
    n_m = len(snap["milestones"])
    n_b = len(snap["blocked"])
    n_s = len(snap["specs"])
    print(f"  minggu {n_w} · fokus {n_f} · tugasan {n_t} · tarikh {n_m} · sekat {n_b} · spesifikasi {n_s}")

    if a.push or a.dry_run:
        sys.exit(push(snap, dry=a.dry_run))


if __name__ == "__main__":
    main()
