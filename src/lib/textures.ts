import * as THREE from 'three';

let cachedWoodTexture: THREE.CanvasTexture | null = null;
let cachedDashboardTexture: THREE.CanvasTexture | null = null;

// Procedural wood-plank texture — keeps the project free of external image
// assets while giving the floor real grain instead of a flat mirror color.
export function getWoodFloorTexture(): THREE.CanvasTexture {
  if (cachedWoodTexture) return cachedWoodTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3b2a1f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const plankHeight = 34;
  const plankCount = Math.ceil(canvas.height / plankHeight);

  for (let p = 0; p < plankCount; p++) {
    const y = p * plankHeight;
    const shade = Math.sin(p * 1.7) * 8 + (Math.random() - 0.5) * 10;
    const r = Math.max(0, Math.min(255, 64 + shade));
    const g = Math.max(0, Math.min(255, 45 + shade * 0.7));
    const b = Math.max(0, Math.min(255, 30 + shade * 0.4));
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, y, canvas.width, plankHeight - 2);

    ctx.strokeStyle = 'rgba(20, 12, 8, 0.25)';
    ctx.lineWidth = 1;
    for (let g2 = 0; g2 < 10; g2++) {
      const gy = y + Math.random() * plankHeight;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      for (let x = 0; x <= canvas.width; x += 32) {
        ctx.lineTo(x, gy + (Math.random() - 0.5) * 2.5);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(10, 6, 4, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();

    if (p % 2 === 0) {
      const seamX = canvas.width * (0.3 + Math.random() * 0.4);
      ctx.beginPath();
      ctx.moveTo(seamX, y);
      ctx.lineTo(seamX, y + plankHeight);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.5, 7);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedWoodTexture = texture;
  return texture;
}

// Baked (static) dashboard mockup — a canvas texture instead of a live Html
// overlay. The Html version's per-frame CSS-transform repositioning was
// flickering as the camera moved (fighting other Html labels for depth
// sort order); a plain texture on a mesh has no such per-frame recompute.
export function getDashboardTexture(): THREE.CanvasTexture {
  if (cachedDashboardTexture) return cachedDashboardTexture;

  const W = 800;
  const H = 506;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f2f2a';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.15, H * 0.5, 20, W * 0.15, H * 0.5, W * 0.6);
  glow.addColorStop(0, 'rgba(45, 212, 191, 0.16)');
  glow.addColorStop(1, 'rgba(45, 212, 191, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const pad = 44;

  // header
  ctx.fillStyle = '#e8e8f5';
  ctx.font = '700 34px Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('P R E S E N C E', pad, 62);

  ctx.fillStyle = 'rgba(45, 212, 191, 0.22)';
  const pillW = 96;
  const pillH = 34;
  const pillX = W - pad - pillW;
  const pillY = 62 - pillH / 2;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 17);
  ctx.fill();
  ctx.fillStyle = '#2dd4bf';
  ctx.font = '700 18px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LIVE', pillX + pillW / 2, pillY + pillH / 2 + 1);
  ctx.textAlign = 'left';

  ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, 100);
  ctx.lineTo(W - pad, 100);
  ctx.stroke();

  // stat rows
  const stats: [string, string][] = [
    ['Occupancy', '92%'],
    ["Check-ins today", '14'],
    ['Open requests', '2'],
  ];
  const rowStart = 150;
  const rowGap = 56;
  stats.forEach(([label, value], i) => {
    const y = rowStart + i * rowGap;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '400 26px Arial, sans-serif';
    ctx.fillText(label, pad, y);
    ctx.fillStyle = '#e8e8f5';
    ctx.font = '700 28px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(value, W - pad, y);
    ctx.textAlign = 'left';
  });

  // divider above chart
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, 340);
  ctx.lineTo(W - pad, 340);
  ctx.stroke();

  // bar chart
  const barHeights = [0.5, 0.8, 0.35, 0.95, 0.6, 0.78];
  const chartTop = 360;
  const chartBottom = 462;
  const chartHeight = chartBottom - chartTop;
  const barGap = 14;
  const barWidth = (W - pad * 2 - barGap * (barHeights.length - 1)) / barHeights.length;
  barHeights.forEach((h, i) => {
    const x = pad + i * (barWidth + barGap);
    const barH = chartHeight * h;
    const y = chartBottom - barH;
    const gradient = ctx.createLinearGradient(0, chartBottom, 0, chartTop);
    gradient.addColorStop(0, '#2dd4bf');
    gradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.55 + h * 0.35;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, 4);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Canvas is 800x506 (not power-of-two, to match the panel's 1.5:0.95
  // aspect) — WebGL's mipmap support for NPOT textures is unreliable, so
  // disable mipmapping rather than risk it on some GPUs. Crisp UI text
  // doesn't want minification blur anyway.
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  cachedDashboardTexture = texture;
  return texture;
}
