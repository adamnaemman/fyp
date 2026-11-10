import Link from "next/link";
import { LINKS } from "@/lib/links";

/**
 * Footer satu-satunya untuk semua halaman (dipasang dalam app/layout.tsx).
 * Pautan luar dibuka dalam tab baru dengan rel noopener noreferrer.
 */
export default function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap foot-wrap">
        <span className="foot-who">
          BagSense · BICS 4321 FYP1 · IIUM KICT · Adam 2418711 · Amru 2419467
        </span>
        <span className="foot-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label} ↗
            </a>
          ))}
          <Link href="/panduan">Panduan</Link>
        </span>
      </div>
    </footer>
  );
}
