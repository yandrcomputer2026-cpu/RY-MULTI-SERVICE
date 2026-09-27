"use client";

export default function IdCardPrintButton() {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
    >
      🖨 Print / Save as PDF
    </button>
  );
}