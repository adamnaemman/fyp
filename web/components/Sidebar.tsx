"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_URL, REPO_URL } from "@/lib/links";

type NavItem = { href: string; label: string; hint: string; external?: boolean };

const NAV: NavItem[] = [
  { href: "/", label: "Progres", hint: "progres mingguan" },
  { href: "/tugasan", label: "Tugasan", hint: "urus batch + tugasan" },
  { href: "/gantt", label: "Gantt", hint: "susunan tugas ikut tarikh" },
  { href: "/calendar", label: "Kalendar", hint: "tugasan ikut hari" },
  { href: "/barang", label: "Pembelian", hint: "senarai beli komponen (BOM)" },
  { href: "/panduan", label: "Panduan", hint: "untuk SV dan Amru" },
  { href: DOC_URL, label: "Laporan", hint: "Google Doc — sumber utama", external: true },
  { href: REPO_URL, label: "Repo", hint: "kod di GitHub", external: true },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="side">
      <Link href="/" className="side-brand">
        <i />
        <span>
          BagSense
          <em>FYP1 · BICS 4321</em>
        </span>
      </Link>

      <nav className="side-nav">
        {NAV.map((n) => {
          const active =
            !n.external && (n.href === "/" ? path === "/" : path.startsWith(n.href));
          const inner = (
            <>
              <b>
                {n.label}
                {n.external ? " ↗" : ""}
              </b>
              <span>{n.hint}</span>
            </>
          );
          return n.external ? (
            <a
              key={n.href}
              href={n.href}
              target="_blank"
              rel="noopener noreferrer"
              className="side-link ext"
            >
              {inner}
            </a>
          ) : (
            <Link key={n.href} href={n.href} className={`side-link ${active ? "on" : ""}`}>
              {inner}
            </Link>
          );
        })}
      </nav>

      <div className="side-foot">
        <span>Adam · Amru · SV</span>
      </div>
    </aside>
  );
}
