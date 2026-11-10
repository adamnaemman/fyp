"use client";

/** Cetak halaman semasa → pengguna pilih "Save as PDF". Tiada dependency PDF. */
export default function PrintButton({ label = "Cetak / PDF" }: { label?: string }) {
  return (
    <button className="btn" type="button" onClick={() => window.print()} title="Cetak atau simpan sebagai PDF">
      🖨 {label}
    </button>
  );
}
