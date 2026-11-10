"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DOC_URL =
  "https://docs.google.com/document/d/1rQ98B42OooaBzW2EFtY4l-BTmJenaSrqJXd2mtJ6JD4/edit?usp=sharing";

const NAV = [
  { href: "/", label: "Progres", hint: "progres mingguan" },
  { href: "/gantt", label: "Gantt", hint: "susunan tugas ikut tarikh" },
  { href: "/calendar", label: "Kalendar", hint: "tugasan ikut hari" },
  { href: DOC_URL, label: "Laporan", hint: "Google Doc — sumber utama", external: true },
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
