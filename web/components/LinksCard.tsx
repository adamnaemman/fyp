import { LINKS } from "@/lib/links";

/** Kad "Pautan" pada laman Progres — salinan sidebar, bukan ganti sidebar. */
export default function LinksCard() {
  return (
    <div className="panel">
      <div className="ph">
        <h3>Pautan</h3>
        <span className="stamp">buka dalam tab baru</span>
      </div>
      <div className="pb links-grid">
        {LINKS.map((l) => (
          <a key={l.href} className="linkrow" href={l.href} target="_blank" rel="noopener noreferrer">
            <b>{l.label} ↗</b>
            <span>{l.hint}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
