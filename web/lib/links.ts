/**
 * Satu sumber untuk pautan luar. Sidebar, footer semua halaman dan kad "Pautan"
 * di laman Progres membaca nilai di sini — tukar sekali sahaja.
 *
 * Pautan dokumen dan repo ini diberi oleh Adam; jangan ganti dengan tekaan.
 */
export const DOC_URL =
  "https://docs.google.com/document/d/1rQ98B42OooaBzW2EFtY4l-BTmJenaSrqJXd2mtJ6JD4/edit?usp=sharing";

export const REPO_URL = "https://github.com/adamnaemman/fyp";

export const LINKS = [
  {
    href: DOC_URL,
    label: "Laporan (Google Docs)",
    hint: "Dokumen bab 1–3 — suntingan teks berlaku di sini.",
  },
  {
    href: REPO_URL,
    label: "Repo GitHub",
    hint: "Kod projek: web, tracker, skrip. Repo private — perlu akses.",
  },
] as const;
