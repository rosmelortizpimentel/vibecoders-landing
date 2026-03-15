import { useMemo } from 'react';
import * as THREE from 'three';

interface GroundProps {
  worldSize: number;
}

export function Ground({ worldSize }: GroundProps) {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Green grass base
    ctx.fillStyle = '#BBF7D0';
    ctx.fillRect(0, 0, size, size);

    // Subtle grass texture variation
    const rng = (s: number) => { let v = s; return () => { v = (v * 16807) % 2147483647; return (v - 1) / 2147483646; }; };
    const rand = rng(123);
    for (let i = 0; i < 200; i++) {
      const x = rand() * size;
      const y = rand() * size;
      ctx.fillStyle = rand() > 0.5 ? 'rgba(134,239,172,0.4)' : 'rgba(74,222,128,0.25)';
      ctx.fillRect(x, y, 3 + rand() * 6, 3 + rand() * 6);
    }

    // Subtle grid for structure
    const gridLines = 20;
    const cellSize = size / gridLines;
    ctx.strokeStyle = 'rgba(34,197,94,0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridLines; i++) {
      const pos = i * cellSize;
      ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(size, pos); ctx.stroke();
    }

    // Central walkway path (lighter concrete)
    const center = size / 2;
    const pathWidth = cellSize * 3;
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(center - pathWidth / 2, 0, pathWidth, size);

    // Path grid overlay
    ctx.strokeStyle = 'rgba(203,213,225,0.4)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridLines; i++) {
      const pos = i * cellSize;
      ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(size, pos); ctx.stroke();
    }

    // Path edge lines
    ctx.strokeStyle = 'rgba(148,163,184,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(center - pathWidth / 2, 0); ctx.lineTo(center - pathWidth / 2, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(center + pathWidth / 2, 0); ctx.lineTo(center + pathWidth / 2, size); ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[worldSize, worldSize]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
