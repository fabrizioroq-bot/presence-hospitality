"use client";

/** Opens the browser's print dialog (choose "Save as PDF" there). */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      Print / Save as PDF
    </button>
  );
}
