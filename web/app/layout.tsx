import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "BagSense — Progres FYP1",
  description:
    "Tracker progres FYP1 BagSense: garis masa minggu, gate, tugasan, bukti, dan tarikh penting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body>
        <div className="app">
          <Sidebar />
          <div className="shell">
            {children}
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
