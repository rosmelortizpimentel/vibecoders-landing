import * as THREE from 'three';

export function createStandRoofTexture(
  title: string,
  speakerName: string,
  dateStr: string,
  color: string,
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.92;
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 1;

  // White inner card area
  const pad = 24;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(pad, pad, size - pad * 2, size - pad * 2);

  // Title (top area)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  wrapText(ctx, title, size / 2, 100, size - 80, 36);

  // Separator line
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(size * 0.15, 220, size * 0.7, 2);

  // Speaker name
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fillText(speakerName, size / 2, 268);

  // Date
  ctx.font = '20px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(dateStr, size / 2, 310);

  // Photo placeholder circle hint (bottom-right — actual photo overlaid as 3D plane)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(size - 80, size - 80, 50, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}
