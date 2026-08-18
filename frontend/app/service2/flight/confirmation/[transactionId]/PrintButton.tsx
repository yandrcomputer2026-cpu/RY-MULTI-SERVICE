"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="w-full rounded-lg bg-gray-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-900"
    >
      Print Confirmation
    </button>
  );
}