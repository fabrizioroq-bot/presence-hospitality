import * as THREE from 'three';

let cachedWoodTexture: THREE.CanvasTexture | null = null;

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
