"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Tracker", hint: "progres mingguan" },
  { href: "/gantt", label: "Gantt", hint: "susunan tugas ikut tarikh" },
  { href: "/calendar", label: "Kalendar", hint: "tugasan ikut hari" },
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
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={`side-link ${active ? "on" : ""}`}>
              <b>{n.label}</b>
              <span>{n.hint}</span>
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
