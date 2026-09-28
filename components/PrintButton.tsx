"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded-md bg-brand px-4 py-3 text-white hover:bg-brand-dark"
    >
      Cetak / Simpan sebagai PDF
    </button>
  );
}
