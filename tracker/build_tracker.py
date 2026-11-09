#!/usr/bin/env python
"""BagSense FYP1 — penjana laman tracker progres.

    python tracker/build_tracker.py            # tulis tracker/index.html
    python tracker/build_tracker.py --serve    # hidang di http://127.0.0.1:9310 (jana semula setiap refresh)
    python tracker/build_tracker.py --json     # dump data mentah (untuk semakan)

Sumber data (semua dibaca, tiada angka direka):
  - Week*/README.md          fokus + gate setiap minggu
  - crew/TASKBOARD.md        kerja aktif + senarai sekat
  - crew/FACTS.md            spesifikasi terkunci, tarikh penting
  - 01_Planning/FYP1_Execution_Plan_W5-W13.md   Plan B / Plan C
  - filesystem               bilangan fail bukti dalam Report/ dan Output/

Apa yang skrip NI TIDAK tahu: sama ada sesuatu gate benar-benar lulus. Fail yang ada
cuma bermakna ada bahan. Sebab itu setiap gate dilabel "belum disahkan", bukan "siap".
"""
from __future__ import annotations

import html
import json
import os
import re
import sys
import time
from datetime import date, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_HTML = os.path.join(ROOT, "tracker", "index.html")

SKIP_DIRS = {".git", "__pycache__", ".venv", "node_modules", ".dart_tool", "build",
             ".gradle", ".idea", "ephemeral", ".plugin_symlinks", "Pods", ".symlinks",
             ".flutter-plugins", "captures", "assets", "gradle"}

MONTHS = {
    "jan": 1, "feb": 2, "mac": 3, "mar": 3, "apr": 4, "mei": 5, "may": 5, "jun": 6,
    "jul": 7, "ogo": 8, "ogos": 8, "aug": 8, "sep": 9, "okt": 10, "oct": 10,
    "nov": 11, "dis": 12, "dec": 12,
}
MON_NAME = {1: "Jan", 2: "Feb", 3: "Mac", 4: "Apr", 5: "Mei", 6: "Jun", 7: "Jul",
            8: "Ogo", 9: "Sep", 10: "Okt", 11: "Nov", 12: "Dis"}

DATE_RE = re.compile(r"(\d{1,2})\s*(\w{3,4})\.?\s*(\d{4})")


def esc(s: str) -> str:
    return html.escape(str(s), quote=False)


def read(path: str) -> str:
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except OSError:
        return ""


def to_date(day: str, mon: str, year: str):
    m = MONTHS.get(mon.lower()[:3])
    if not m:
        return None
    try:
        return date(int(year), m, int(day))
    except ValueError:
        return None


def find_date(text: str):
    m = DATE_RE.search(text)
    return to_date(*m.groups()) if m else None


DOC_EXT = {"pdf", "docx", "doc", "xlsx", "xls", "pptx", "ppt", "csv", "md", "png", "jpg",
           "jpeg", "svg", "log", "txt", "blend", "glb", "obj", "stl", "gif", "mp4", "drawio"}
# folder yang dijana `flutter create` / toolchain — bukan hasil kerja, jangan dikira sebagai bukti
SCAFFOLD = ("/android/", "/ios/", "/web/", "/macos/", "/windows/", "/linux/",
            "/res/", "/mipmap", "/.idea/", "/gradle/")


def count_files(folder: str):
    """(dokumen/data, kod, scaffolding, mtime terbaru) — scaffolding diasingkan supaya angka tak tipu."""
    docs = code = scaffold = 0
    newest = None
    if not os.path.isdir(folder):
        return 0, 0, 0, None
    for base, dirs, files in os.walk(folder):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            full = os.path.join(base, f)
            rel = "/" + os.path.relpath(full, folder).replace("\\", "/").lower()
            ext = os.path.splitext(f)[1].lstrip(".").lower()
            if any(h in rel for h in SCAFFOLD):
                scaffold += 1
            elif ext in DOC_EXT:
                docs += 1
            else:
                code += 1
            try:
                mt = os.path.getmtime(full)
            except OSError:
                continue
            if newest is None or mt > newest:
                newest = mt
    return docs, code, scaffold, newest


def fmt_range(s: date, e: date) -> str:
    if s.month == e.month and s.year == e.year:
        return f"{s.day:02d}–{e.day:02d} {MON_NAME[s.month]} {e.year}"
    return f"{s.day:02d} {MON_NAME[s.month]} – {e.day:02d} {MON_NAME[e.month]} {e.year}"


# ---------------------------------------------------------------- week parsing
def parse_weeks(today: date):
    weeks = []
    for name in sorted(os.listdir(ROOT)):
        d = os.path.join(ROOT, name)
        if not (name.startswith("Week") and os.path.isdir(d)):
            continue
        md = os.path.join(d, "README.md")
        if not os.path.isfile(md):
            continue
        text = read(md)
        m = re.match(r"Week\s*(\d+)([A-Z]?)", name)
        num, suffix = (int(m.group(1)), m.group(2)) if m else (0, "")

        title = (text.splitlines() or [""])[0]
        # "# Week 5 - 26 Oct - 01 Nov 2026"  |  "# Week 13 - 28 Dec 2026 - 03 Jan 2027"
        rng = re.search(r"\d{1,2}\s+\w{3}(?:\s+\d{4})?\s*[-–]\s*\d{1,2}\s+\w{3}\s*\d{4}", title)
        start = end = None
        if rng:
            parts = re.findall(r"(\d{1,2})\s+(\w{3})(?:\s+(\d{4}))?", rng.group(0))
            if len(parts) >= 2:
                (d1, m1, y1), (d2, m2, y2b) = parts[0], parts[1]
                y2 = int(y2b)
                y1 = int(y1) if y1 else (y2 - 1 if MONTHS.get(m2.lower()[:3], 0) <
                                         MONTHS.get(m1.lower()[:3], 0) else y2)
                start = to_date(d1, m1, str(y1))
                end = to_date(d2, m2, str(y2))

        sem = ""
        ms = re.search(r"^Seminar:\s*(.+)$", text, re.M)
        if ms:
            sem = ms.group(1).strip()

        def section(head: str) -> str:
            m2 = re.search(rf"^##\s*{re.escape(head)}[^\n]*\n(.*?)(?=^##\s|\Z)", text, re.M | re.S)
            return m2.group(1).strip() if m2 else ""

        gate = " ".join(section("Gate (boleh diuji sendiri)").split())
        focus = []
        for line in section("Fokus minggu ini").splitlines():
            fm = re.match(r"^-\s*\[([ xX])\]\s*(.+)$", line.strip())
            if fm:
                focus.append({"text": fm.group(2).strip(), "done": fm.group(1).lower() == "x"})

        out_docs, out_code, out_scr, out_mt = count_files(os.path.join(d, "Output"))
        rep_docs, rep_code, rep_scr, rep_mt = count_files(os.path.join(d, "Report"))
        newest = max([x for x in (out_mt, rep_mt) if x] or [0]) or None

        if start and end:
            if today < start:
                state = "akan"
            elif today > end:
                state = "lepas"
            else:
                state = "kini"
        else:
            state = "?"

        weeks.append({
            "folder": name, "num": num, "suffix": suffix, "label": f"Minggu {num}{suffix}",
            "sort": (num, suffix), "start": start, "end": end, "state": state,
            "seminar": sem, "gate": gate or "—", "focus": focus,
            "out_n": out_docs, "out_code": out_code, "out_scr": out_scr,
            "rep_n": rep_docs, "rep_code": rep_code, "rep_scr": rep_scr,
            "newest": newest,
            "range": fmt_range(start, end) if (start and end) else "tarikh tak terbaca",
        })
    weeks.sort(key=lambda w: w["sort"])
    return weeks


# --------------------------------------------------------------- taskboard
def parse_tasks():
    text = read(os.path.join(ROOT, "crew", "TASKBOARD.md"))
    batches, blocked = [], []
    current = None
    in_blocked = False
    for raw in text.splitlines():
        line = raw.strip()
        hb = re.match(r"^##\s*Batch\s*(\d+)\s*(?:[—–-]\s*([\d-]{10})?)?\s*(.*)$", line)
        if hb:
            note = hb.group(3).strip().lstrip("—–-·").strip()
            current = {"no": int(hb.group(1)), "date": hb.group(2) or "tarikh belum ditetapkan",
                       "note": note, "rows": []}
            batches.append(current)
            in_blocked = False
            continue
        if re.match(r"^##\s*Sekat", line):
            in_blocked, current = True, None
            continue
        if line.startswith("## "):
            in_blocked, current = False, None
            continue
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 2 or set("".join(cells)) <= set("-: "):
            continue
        if cells[0].lower() in ("#", "") and len(cells) > 1 and "role" in cells[1].lower():
            continue
        if cells[0].lower() in ("#", "benda", "item", "tugas", "gate", "") and len(cells) < 6:
            continue
        if in_blocked:
            blocked.append({"what": cells[0], "why": cells[1] if len(cells) > 1 else ""})
            continue
        if current is None:
            continue
        status_raw = cells[-1]
        low = status_raw.lower()
        if low.startswith("siap"):
            st = "siap"
        elif low.startswith("jalan"):
            st = "jalan"
        elif low.startswith("sekat"):
            st = "sekat"
        else:
            st = "brief"
        current["rows"].append({
            "id": cells[0], "role": cells[1] if len(cells) > 1 else "",
            "task": cells[2] if len(cells) > 2 else "",
            "status": st, "detail": status_raw,
        })
    return batches, blocked


# ------------------------------------------------------------------ facts
def parse_facts(today: date):
    text = read(os.path.join(ROOT, "crew", "FACTS.md"))

    def section(head: str) -> str:
        m = re.search(rf"^##\s*{re.escape(head)}[^\n]*\n(.*?)(?=^##\s|\Z)", text, re.M | re.S)
        return m.group(1).strip() if m else ""

    who = []
    for line in section("Projek").splitlines():
        m = re.match(r"^-\s*(.+)$", line.strip())
        if m:
            who.append(m.group(1).strip())

    specs = []
    for line in section("Spesifikasi yang dikunci").splitlines():
        m = re.match(r"^-\s*([^:]+):\s*(.+?)\.?$", line.strip())
        if m:
            specs.append({"k": m.group(1).strip(),
                          "v": m.group(2).replace("**", "").strip()})

    milestones = []
    for line in section("Tarikh").splitlines():
        m = re.match(r"^-\s*(.+?):\s*(.+)$", line.strip())
        if not m:
            continue
        label, val = m.group(1).strip(), m.group(2).strip()
        d = find_date(val)
        if not d:
            continue
        milestones.append({"label": label, "raw": val, "date": d, "days": (d - today).days})
    return who, specs, milestones


def parse_plans():
    text = read(os.path.join(ROOT, "01_Planning", "FYP1_Execution_Plan_W5-W13.md"))
    m = re.search(r"^##\s*5\..*?\n(.*?)(?=^##\s|\Z)", text, re.M | re.S)
    body = m.group(1) if m else ""
    plans = []
    for pm in re.finditer(r"\*\*(Plan [B-Z])[^*]*\*\*\s*(.+?)(?=\n\*\*Plan|\Z)", body, re.S):
        txt = " ".join(pm.group(2).split()).lstrip("—:- ").strip()
        txt = re.sub(r"[\s\-–—]+$", "", txt).strip()
        plans.append({"name": pm.group(1), "text": txt})
    return plans


# ------------------------------------------------------------------ collect
def collect():
    today = date.today()
    weeks = parse_weeks(today)
    batches, blocked = parse_tasks()
    who, specs, milestones = parse_facts(today)
    plans = parse_plans()

    tasks = [r for b in batches for r in b["rows"]]
    focus_total = sum(len(w["focus"]) for w in weeks)
    focus_done = sum(1 for w in weeks for f in w["focus"] if f["done"])
    out_total = sum(w["out_n"] for w in weeks)
    out_code_total = sum(w["out_code"] for w in weeks)
    out_scr_total = sum(w["out_scr"] for w in weeks)
    rep_total = sum(w["rep_n"] for w in weeks)

    project_files = 0
    for base, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        relbase = "/" + os.path.relpath(base, ROOT).replace("\\", "/").lower() + "/"
        if any(h in relbase for h in SCAFFOLD):
            dirs[:] = []
            continue
        project_files += len(files)

    timed = [w for w in weeks if w["start"] and w["end"]]
    cur = next((w for w in weeks if w["state"] == "kini"), None)
    span_start = min(w["start"] for w in timed) if timed else today
    span_end = max(w["end"] for w in timed) if timed else today
    total_days = max((span_end - span_start).days + 1, 1)
    if today <= span_start:
        elapsed = 0.0
    elif today >= span_end:
        elapsed = 1.0
    else:
        elapsed = ((today - span_start).days) / total_days

    done_weeks = [w for w in weeks if w["state"] == "lepas"]
    next_ms = next((m for m in sorted(milestones, key=lambda m: m["date"])
                    if m["date"] >= today), None)

    return {
        "generated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "today": today.isoformat(),
        "root": ROOT,
        "weeks": weeks, "batches": batches, "blocked": blocked,
        "who": who, "specs": specs, "milestones": milestones, "plans": plans,
        "stats": {
            "weeks_total": len(weeks), "weeks_past": len(done_weeks),
            "cur_label": cur["label"] if cur else "—",
            "elapsed": round(elapsed * 100, 1),
            "focus_total": focus_total, "focus_done": focus_done,
            "tasks_total": len(tasks),
            "tasks_done": sum(1 for t in tasks if t["status"] == "siap"),
            "tasks_brief": sum(1 for t in tasks if t["status"] == "brief"),
            "out_total": out_total, "out_code": out_code_total, "out_scr": out_scr_total,
            "rep_total": rep_total,
            "project_files": project_files, "blocked": len(blocked),
            "next_ms": next_ms["label"] if next_ms else "—",
            "next_ms_days": next_ms["days"] if next_ms else None,
            "span": f"{fmt_range(span_start, span_end)}" if timed else "—",
        },
    }


# ------------------------------------------------------------------- render
CSS = """
:root{
  --bg:#080b10; --bg2:#0b1017; --panel:#0f151d; --panel2:#121a24;
  --line:#1d2733; --line2:#26313f;
  --tx:#e8eef6; --dim:#8b9bad; --dim2:#617083;
  --green:#4ade80; --amber:#fbbf24; --sky:#38bdf8; --red:#f87171; --violet:#a78bfa;
  --mono:"Cascadia Mono",Consolas,"SF Mono",Menlo,monospace;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:
  radial-gradient(900px 500px at 15% -10%,rgba(74,222,128,.06),transparent 70%),
  radial-gradient(700px 400px at 100% 0%,rgba(56,189,248,.05),transparent 70%),
  var(--bg);
  color:var(--tx);font:15px/1.55 "Segoe UI",system-ui,-apple-system,sans-serif;
  font-variant-numeric:tabular-nums}
a{color:var(--sky);text-decoration:none}
.wrap{max-width:1140px;margin:0 auto;padding:0 22px 80px}
.top{position:sticky;top:0;z-index:9;background:rgba(8,11,16,.82);
  backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.top .wrap{padding:13px 22px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.brand{font-weight:650;letter-spacing:-.01em;display:flex;align-items:center;gap:9px}
.brand i{width:8px;height:8px;border-radius:50%;background:var(--green);
  box-shadow:0 0 0 4px rgba(74,222,128,.14)}
.brand small{font-weight:400;color:var(--dim2);letter-spacing:.04em;font-size:12px}
.top .spacer{flex:1}
.stamp{font:12px var(--mono);color:var(--dim2)}

/* hero */
.hero{display:grid;grid-template-columns:1fr 200px;gap:28px;align-items:center;
  padding:44px 0 34px}
.kicker{margin:0 0 10px;font:12px var(--mono);letter-spacing:.14em;text-transform:uppercase;
  color:var(--green)}
h1{margin:0 0 12px;font-size:clamp(28px,4.4vw,44px);line-height:1.06;letter-spacing:-.025em;
  font-weight:680}
h1 span{color:var(--dim)}
.sub{margin:0;color:var(--dim);max-width:56ch}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}
.chip{border:1px solid var(--line2);background:var(--panel);border-radius:999px;
  padding:5px 13px;font-size:12.5px;color:var(--dim);display:inline-flex;align-items:center;gap:7px}
.chip b{color:var(--tx);font-weight:600}
.chip.hot{border-color:rgba(251,191,36,.35);background:rgba(251,191,36,.07);color:#f3d489}
.chip.hot b{color:var(--amber)}

/* ring */
.ring{--p:0;width:176px;height:176px;border-radius:50%;justify-self:end;
  background:conic-gradient(var(--green) calc(var(--p)*1%),#16202b 0);
  display:grid;place-items:center;position:relative;
  box-shadow:0 0 46px rgba(74,222,128,.10)}
.ring::after{content:"";position:absolute;inset:11px;border-radius:50%;background:var(--bg2);
  border:1px solid var(--line)}
.ring .in{position:relative;text-align:center;z-index:1}
.ring .in b{display:block;font-size:34px;font-weight:660;letter-spacing:-.03em}
.ring .in b span{font-size:18px;color:var(--dim)}
.ring .in em{font-style:normal;font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;
  color:var(--dim2);font-family:var(--mono)}

/* stats */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin-bottom:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:16px 17px}
.card .lbl{font:10.5px var(--mono);letter-spacing:.11em;text-transform:uppercase;color:var(--dim2)}
.card .val{font-size:27px;font-weight:650;letter-spacing:-.02em;margin:7px 0 2px;line-height:1.1}
.card .val small{font-size:14px;color:var(--dim);font-weight:500}
.card .sub2{font-size:12px;color:var(--dim)}
.bar{height:3px;border-radius:3px;background:#1a232f;margin-top:11px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--green);border-radius:3px}
.bar.amber i{background:var(--amber)} .bar.sky i{background:var(--sky)}

/* section head */
h2.sec{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);
  margin:44px 0 4px;font-family:var(--mono);font-weight:500}
.secnote{color:var(--dim2);font-size:12.5px;margin:0 0 18px;max-width:78ch}

/* timeline */
.tl{position:relative;padding-left:0}
.wk{display:grid;grid-template-columns:26px 1fr;gap:0}
.rail{position:relative}
.rail::before{content:"";position:absolute;left:11px;top:0;bottom:0;width:2px;background:var(--line)}
.wk:first-child .rail::before{top:16px}
.wk:last-child .rail::before{bottom:calc(100% - 16px)}
.dot{position:absolute;left:4px;top:11px;width:16px;height:16px;border-radius:50%;
  background:var(--bg);border:2px solid var(--line2);z-index:1}
.wk.lepas .dot{border-color:var(--green);background:var(--green)}
.wk.kini .dot{border-color:var(--amber);box-shadow:0 0 0 5px rgba(251,191,36,.15);background:var(--amber)}
.body{padding:0 0 16px 6px;min-width:0}
.wkcard{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:15px 17px;min-width:0}
.wk.kini .wkcard{border-color:rgba(251,191,36,.3);background:linear-gradient(180deg,rgba(251,191,36,.045),transparent 60%),var(--panel)}
.wk.lepas .wkcard{background:var(--bg2)}
.wkhead{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:6px}
.wkhead h3{margin:0;font-size:16.5px;font-weight:630;letter-spacing:-.01em}
.wkhead .rng{font:12px var(--mono);color:var(--dim2)}
.tag{font:10.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;padding:2px 8px;
  border-radius:999px;border:1px solid var(--line2);color:var(--dim2)}
.tag.kini{color:#f3d489;border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.08)}
.tag.lepas{color:#7ddca4;border-color:rgba(74,222,128,.3);background:rgba(74,222,128,.07)}
.sem{color:var(--dim);font-size:13px;margin:0 0 11px}
.sem b{color:var(--tx);font-weight:600}
.gate{display:flex;gap:10px;row-gap:5px;flex-wrap:wrap;align-items:flex-start;background:var(--bg2);border:1px solid var(--line);
  border-left:2px solid var(--line2);border-radius:8px;padding:9px 12px;margin-bottom:12px}
.wk.kini .gate{border-left-color:var(--amber)}
.gk{font:10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--dim2);
  padding-top:3px;flex:0 0 auto}
.gate p{margin:0;font-size:13.2px;color:#cfdbe8;flex:1;min-width:0}
.ev{font:11px var(--mono);color:var(--dim2);flex:0 0 auto;padding-top:3px}
ul.focus{list-style:none;margin:0;padding:0;display:grid;gap:5px}
ul.focus li{font-size:13.2px;color:#c2cfdd;display:flex;gap:9px;align-items:flex-start}
ul.focus li::before{content:"☐";color:var(--dim2);font-size:14px;line-height:1.3}
ul.focus li.done{color:var(--dim2);text-decoration:line-through}
ul.focus li.done::before{content:"☑";color:var(--green);text-decoration:none}

/* two cols */
.cols{display:grid;grid-template-columns:1.15fr .85fr;gap:14px;align-items:start}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:13px;overflow:hidden}
.panel>.ph{padding:13px 16px;border-bottom:1px solid var(--line);display:flex;
  justify-content:space-between;align-items:center;gap:10px}
.panel>.ph h3{margin:0;font-size:13px;letter-spacing:.09em;text-transform:uppercase;
  color:var(--dim);font-family:var(--mono);font-weight:500}
.panel>.pb{padding:6px 16px 14px}
.batch{margin:12px 0 2px;font:11px var(--mono);letter-spacing:.08em;text-transform:uppercase;
  color:var(--dim2)}
.batch b{color:var(--sky);font-weight:600}
.task{display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-bottom:1px solid #141c25}
.task:last-child{border-bottom:0}
.task .id{font:11px var(--mono);color:var(--dim2);flex:0 0 34px;padding-top:2px}
.task .t{flex:1;font-size:13px;color:#c8d4e2}
.task .t em{display:block;font-style:normal;font-size:11.5px;color:var(--dim2);margin-top:2px}
.st{font:10px var(--mono);letter-spacing:.07em;text-transform:uppercase;padding:2px 7px;
  border-radius:5px;flex:0 0 auto;border:1px solid}
.st.siap{color:#7ddca4;border-color:rgba(74,222,128,.32);background:rgba(74,222,128,.08)}
.st.jalan{color:#f3d489;border-color:rgba(251,191,36,.32);background:rgba(251,191,36,.08)}
.st.brief{color:var(--dim);border-color:var(--line2)}
.st.sekat{color:#f7a1a1;border-color:rgba(248,113,113,.32);background:rgba(248,113,113,.08)}

/* milestones */
.ms{display:flex;gap:12px;padding:9px 0;border-bottom:1px solid #141c25;align-items:baseline}
.ms:last-child{border-bottom:0}
.ms .d{font:11.5px var(--mono);color:var(--dim);flex:0 0 74px}
.ms .l{flex:1;font-size:13px;color:#c8d4e2}
.ms .n{font:11px var(--mono);flex:0 0 auto}
.ms.past{opacity:.55}
.ms.next .n{color:var(--amber)}
.ms.next .l{color:#fff;font-weight:600}
.ms .n.soon{color:var(--red)}

/* blocked / specs */
.blk{padding:9px 0;border-bottom:1px solid #141c25}
.blk:last-child{border-bottom:0}
.blk b{display:block;font-size:13px;color:#f7c7c7;font-weight:600}
.blk span{font-size:12.2px;color:var(--dim)}
.kv{display:grid;grid-template-columns:auto 1fr;gap:5px 14px;font-size:13px;padding:4px 0 9px;margin:0}
.kv dt{color:var(--dim2);font:11.5px var(--mono);text-transform:uppercase;letter-spacing:.06em}
.kv dd{margin:0;color:#cfdbe8}
.plans{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.plan{background:var(--panel);border:1px solid var(--line);border-left:2px solid var(--violet);
  border-radius:10px;padding:14px 16px}
.plan h3{margin:0 0 6px;font-size:13.5px;color:#cdbbfd;letter-spacing:.01em}
.plan p{margin:0;font-size:13px;color:#c2cfdd}

/* what we can't know */
.caveat{margin-top:26px;border:1px dashed var(--line2);border-radius:12px;padding:15px 17px;
  background:rgba(56,189,248,.03)}
.caveat h3{margin:0 0 6px;font-size:13px;color:#a9d7f5;letter-spacing:.02em}
.caveat p{margin:0 0 8px;font-size:13px;color:var(--dim)}
.caveat p:last-child{margin:0}
code{font:12px var(--mono);background:#131b24;border:1px solid var(--line);border-radius:5px;
  padding:1px 5px;color:#c9d7e6}
footer{margin-top:38px;padding-top:18px;border-top:1px solid var(--line);color:var(--dim2);
  font-size:12px;display:flex;gap:18px;flex-wrap:wrap;justify-content:space-between}
@media (max-width:820px){
  .hero{grid-template-columns:1fr;padding:30px 0 24px}
  .ring{justify-self:start;width:132px;height:132px}
  .ring .in b{font-size:26px}
  .cols,.plans{grid-template-columns:1fr}
  .top .wrap{padding:11px 22px}
  .wrap{padding:0 14px 60px}
}
@media (max-width:520px){
  .top .stamp{display:none}
  .gate{display:block}
  .gate .gk{display:block;margin-bottom:3px}
  .gate .ev{display:block;margin-top:6px;padding-top:0}
  .hero .chips .chip{font-size:12px}
  .card .val{font-size:24px}
}
@media print{
  body{background:#fff;color:#111} .top,.ring,.caveat{display:none}
  .card,.panel,.wkcard,.plan{border-color:#ccc;background:#fff}
}
"""


def status_badge(state):
    if state == "kini":
        return '<span class="tag kini">minggu ini</span>'
    if state == "lepas":
        return '<span class="tag lepas">lepas</span>'
    if state == "akan":
        return '<span class="tag">akan datang</span>'
    return ""


def render_week(w):
    focus = "".join(
        f'<li class="{"done" if f["done"] else ""}">{esc(f["text"])}</li>' for f in w["focus"]
    ) or '<li class="">tiada senarai fokus dalam README</li>'
    newest = datetime.fromtimestamp(w["newest"]).strftime("%d %b") if w["newest"] else "—"
    ev = f"Output {w['out_n']} dok"
    if w["out_code"]:
        ev += f" + {w['out_code']} kod"
    if w["rep_n"]:
        ev += f" · Report {w['rep_n']}"
    return f"""
    <div class="wk {w['state']}">
      <div class="rail"><span class="dot"></span></div>
      <div class="body">
        <div class="wkcard">
          <div class="wkhead">
            <h3>{esc(w['label'])}</h3>
            <span class="rng">{esc(w['range'])}</span>
            {status_badge(w['state'])}
          </div>
          <p class="sem">{esc(w['seminar'])}</p>
          <div class="gate">
            <span class="gk">Gate</span>
            <p>{esc(w['gate'])}</p>
            <span class="ev">{ev}</span>
          </div>
          <ul class="focus">{focus}</ul>
          <p class="ev" style="margin:9px 0 0">fail terbaru: {newest}</p>
        </div>
      </div>
    </div>"""


def render_tasks(batches):
    if not batches:
        return '<p class="secnote">TASKBOARD.md tak dijumpai.</p>'
    out = []
    for b in batches:
        rows = "".join(
            f"""<div class="task"><span class="id">{esc(r['id'])}</span>
            <span class="t">{esc(r['task'])}<em>{esc(r['role'])} · {esc(r['detail'][:120])}</em></span>
            <span class="st {r['status']}">{r['status']}</span></div>"""
            for r in b["rows"])
        out.append(f'<div class="batch"><b>Batch {b["no"]}</b> · {esc(b["date"])}'
                   f'{" · " + esc(b["note"]) if b["note"] else ""}</div>{rows}')
    return "".join(out)


def render_milestones(ms, today: date):
    out = []
    ordered = sorted(ms, key=lambda m: m["date"])
    nxt = next((m for m in ordered if m["date"] >= today), None)
    for m in ordered:
        d = m["date"].strftime("%d %b %y")
        days = m["days"]
        cls = "past" if days < 0 else ("next" if nxt is m else "")
        if days < 0:
            note = f"{abs(days)}h lalu"
        elif days == 0:
            note = "hari ini"
        else:
            note = f"{days} hari"
        ncls = "soon" if 0 <= days <= 7 else ""
        out.append(f'<div class="ms {cls}"><span class="d">{d}</span>'
                   f'<span class="l">{esc(m["label"])}</span>'
                   f'<span class="n {ncls}">{note}</span></div>')
    return "".join(out)


def render(data) -> str:
    s = data["stats"]
    today = date.fromisoformat(data["today"])
    weeks = data["weeks"]
    nxt = next((m for m in sorted(data["milestones"], key=lambda m: m["date"])
                if m["date"] >= today), None)
    chip_next = ""
    if nxt:
        d = nxt["days"]
        when = "hari ini" if d == 0 else ("esok" if d == 1 else f"{d} hari lagi")
        chip_next = (f'<span class="chip hot">Seterusnya · <b>{esc(nxt["label"])}</b> · '
                     f'{nxt["date"].strftime("%d %b")} · {when}</span>')

    focus_pct = (s["focus_done"] / s["focus_total"] * 100) if s["focus_total"] else 0
    task_pct = (s["tasks_done"] / s["tasks_total"] * 100) if s["tasks_total"] else 0

    wd = {}
    for line in data["who"]:
        if ":" in line:
            k, v = line.split(":", 1)
            wd[k.strip().lower()] = v.strip().rstrip(".")
    foot_who = " · ".join(x for x in (wd.get("adam", ""), wd.get("rakan", "")) if x)

    return f"""<!doctype html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BagSense — Progres FYP1</title>
<style>{CSS}</style>
</head>
<body>
<div class="top"><div class="wrap">
  <div class="brand"><i></i>BagSense <small>FYP1 · BICS 4321</small></div>
  <div class="spacer"></div>
  <div class="stamp">dijana {esc(data['generated'])} · {s['project_files']} fail</div>
</div></div>

<div class="wrap">

  <section class="hero">
    <div>
      <p class="kicker">Minggu aktif · {esc(s['cur_label'])} daripada {s['weeks_total']}</p>
      <h1>Progres FYP1 <span>— BagSense</span></h1>
      <p class="sub">Beg pintar Edge-IoT: ESP32-S3, pembaca UHF RFID 919–923 MHz, E-paper,
        app Flutter. Setiap angka di halaman ni dibaca terus dari fail projek — tiada yang direka.</p>
      <div class="chips">
        <span class="chip">Tempoh projek <b>{esc(s['span'])}</b></span>
        {chip_next}
        <span class="chip">Sekat <b>{s['blocked']}</b></span>
      </div>
    </div>
    <div class="ring" style="--p:{s['elapsed']}">
      <div class="in"><b>{s['elapsed']:g}<span>%</span></b><em>masa berlalu</em></div>
    </div>
  </section>

  <section class="stats">
    <div class="card">
      <div class="lbl">Minggu</div>
      <div class="val">{s['weeks_past']}<small> / {s['weeks_total']} lepas</small></div>
      <div class="sub2">seminggu dianggap lepas bila tarikh tamatnya sudah berlalu</div>
      <div class="bar"><i style="width:{s['weeks_past'] / max(s['weeks_total'],1) * 100:.0f}%"></i></div>
    </div>
    <div class="card">
      <div class="lbl">Item fokus</div>
      <div class="val">{s['focus_done']}<small> / {s['focus_total']} ditanda</small></div>
      <div class="sub2">dikira dari kotak <code>[ ]</code> dalam README mingguan</div>
      <div class="bar sky"><i style="width:{focus_pct:.0f}%"></i></div>
    </div>
    <div class="card">
      <div class="lbl">Tugasan</div>
      <div class="val">{s['tasks_done']}<small> / {s['tasks_total']} siap</small></div>
      <div class="sub2">{s['tasks_brief']} masih brief · {s['blocked']} sekat</div>
      <div class="bar"><i style="width:{task_pct:.0f}%"></i></div>
    </div>
    <div class="card">
      <div class="lbl">Bahan bukti</div>
      <div class="val">{s['out_total']}<small> dokumen/data</small></div>
      <div class="sub2">{s['out_code']} fail kod · {s['rep_total']} dalam Report/ ·
        scaffolding Flutter tak dikira</div>
      <div class="bar amber"><i style="width:{min(100, s['out_total'] * 2):.0f}%"></i></div>
    </div>
  </section>

  <h2 class="sec">Garis masa mingguan</h2>
  <p class="secnote">Gate setiap minggu ialah syarat yang boleh diuji sendiri. Lencana gate
    sengaja <b>tiada</b>: skrip cuma tahu berapa fail ada, bukan sama ada ujian benar-benar lulus.
    Bilangan fail di kanan gate ialah bahan mentah, bukan bukti lulus.</p>
  <div class="tl">{''.join(render_week(w) for w in weeks)}</div>

  <h2 class="sec">Kerja aktif dan tarikh penting</h2>
  <p class="secnote">Tugasan disalin dari <code>crew/TASKBOARD.md</code>; tarikh dari
    <code>crew/FACTS.md</code>. Kemas kini fail itu, jana semula, dan halaman ini ikut berubah.</p>
  <div class="cols">
    <div class="panel">
      <div class="ph"><h3>Tugasan ikut batch</h3>
        <span class="stamp">{s['tasks_done']} siap / {s['tasks_total']}</span></div>
      <div class="pb">{render_tasks(data['batches'])}</div>
    </div>
    <div>
      <div class="panel">
        <div class="ph"><h3>Tarikh penting</h3><span class="stamp">hari ini {today.strftime('%d %b %y')}</span></div>
        <div class="pb">{render_milestones(data['milestones'], today)}</div>
      </div>
      <div class="panel" style="margin-top:14px">
        <div class="ph"><h3>Tersekat — perlu Adam</h3>
          <span class="stamp">{len(data['blocked'])} item</span></div>
        <div class="pb">
          {''.join(f'<div class="blk"><b>{esc(b["what"])}</b><span>{esc(b["why"])}</span></div>' for b in data['blocked'])
           or '<p class="secnote">Tiada item tersekat direkod.</p>'}
        </div>
      </div>
    </div>
  </div>

  <h2 class="sec">Skop dan pelan sandaran</h2>
  <p class="secnote">Spesifikasi terkunci dan Plan B/C disalin dari pelan induk — ini yang
    menghalang keputusan panik pada minggu ke-12.</p>
  <div class="cols">
    <div class="panel">
      <div class="ph"><h3>Spesifikasi terkunci</h3></div>
      <div class="pb"><dl class="kv">
        {''.join(f'<dt>{esc(x["k"])}</dt><dd>{esc(x["v"])}</dd>' for x in data['specs'])}
      </dl>
      <p class="secnote" style="margin:0">Ubah hanya dengan kelulusan penyelia.</p></div>
    </div>
    <div>
      {''.join(f'<div class="plan" style="margin-bottom:12px"><h3>{esc(p["name"])}</h3>'
               f'<p>{esc(p["text"])}</p></div>' for p in data['plans'])}
    </div>
  </div>

  <div class="caveat">
    <h3>Apa yang halaman ini tak tahu</h3>
    <p>Semua nombor di atas dijana skrip dari fail: kotak semak dalam <code>WeekNN/README.md</code>,
      jadual dalam <code>crew/TASKBOARD.md</code>, tarikh dalam <code>crew/FACTS.md</code>, dan
      bilangan fail dalam <code>Report/</code> dan <code>Output/</code>. Kalau sesuatu sudah dibuat
      tetapi kotak belum ditanda, ia tetap dikira belum.</p>
    <p>Jana semula: <code>python tracker/build_tracker.py</code> ·
      papar hidup: <code>python tracker/build_tracker.py --serve</code> → http://127.0.0.1:9310</p>
  </div>

  <footer>
    <span>{esc(foot_who)} · BICS 4321 FYP1 · IIUM KICT</span>
    <span>Dijana {esc(data['generated'])} dari {esc(data['root'])}</span>
  </footer>
</div>
</body>
</html>
"""


# --------------------------------------------------------------------- serve
def serve(port: int):
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

    class H(BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def _send(self, code, body: bytes, ctype="text/html; charset=utf-8"):
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            path = self.path.split("?")[0]
            try:
                data = collect()
            except Exception as e:  # noqa: BLE001
                self._send(500, f"ralat jana: {e}".encode())
                return
            if path in ("/", "/index.html"):
                self._send(200, render(data).encode("utf-8"))
            elif path == "/api/state":
                self._send(200, json.dumps(data, default=str, ensure_ascii=False).encode("utf-8"),
                           "application/json; charset=utf-8")
            else:
                self._send(404, b"404")

    srv = ThreadingHTTPServer(("127.0.0.1", port), H)
    print(f"BagSense tracker: http://127.0.0.1:{port}  (Ctrl+C untuk berhenti)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("berhenti")


def main():
    import argparse
    ap = argparse.ArgumentParser(description="Jana laman tracker progres FYP1 BagSense.")
    ap.add_argument("--serve", action="store_true", help="hidang http://127.0.0.1:9310 (jana semula setiap refresh)")
    ap.add_argument("--json", action="store_true", help="cetak data mentah")
    ap.add_argument("--port", type=int, default=9310)
    ap.add_argument("--out", default=OUT_HTML)
    a = ap.parse_args()

    if a.serve:
        serve(a.port)
        return

    data = collect()
    if a.json:
        print(json.dumps(data, indent=2, default=str, ensure_ascii=False))
        return
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(render(data))
    s = data["stats"]
    print(f"ditulis {a.out}")
    print(f"  minggu: {s['weeks_total']} ({s['weeks_past']} lepas, aktif: {s['cur_label']})")
    print(f"  fokus: {s['focus_done']}/{s['focus_total']} · tugasan: {s['tasks_done']}/{s['tasks_total']}"
          f" · bukti: {s['out_total']} Output + {s['rep_total']} Report")
    print(f"  masa berlalu: {s['elapsed']}% · sekat: {s['blocked']} · fail projek: {s['project_files']}")


if __name__ == "__main__":
    main()
