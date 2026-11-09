import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BagSense — Progres FYP1",
  description:
    "Tracker progres FYP1 BagSense: garis masa minggu, gate, tugasan, bukti, dan tarikh penting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
