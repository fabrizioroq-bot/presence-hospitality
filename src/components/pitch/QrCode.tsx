import qrcode from "qrcode-generator";

/**
 * A QR code rendered on the server as an inline SVG (no client JS, no runtime fetch), dark modules on
 * white with the standard 4-module quiet zone. Error correction M survives a projector's glare.
 */
export function QrCode({ value, label, className }: { value: string; label: string; className?: string }) {
  const qr = qrcode(0, "M");
  qr.addData(value);
  qr.make();
  const n = qr.getModuleCount();
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return (
    <svg viewBox={`-4 -4 ${n + 8} ${n + 8}`} role="img" aria-label={label} className={className} shapeRendering="crispEdges">
      <rect x={-4} y={-4} width={n + 8} height={n + 8} fill="var(--ui-num-bg)" />
      <path d={d} fill="var(--pitch-ink)" />
    </svg>
  );
}
