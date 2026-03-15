import { useRef, useEffect } from 'react';
import { STAND_COLORS } from '../../constants';
import type { StandPosition, RemotePlayer } from '../../types';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  standPositions: StandPosition[];
  visitedIds: string[];
  workshopIds: string[];
  remotePlayers: Map<string, RemotePlayer>;
  worldSize: number;
}

const SIZE = 120;

export function Minimap({ playerX, playerZ, standPositions, visitedIds, workshopIds, remotePlayers, worldSize }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.roundRect(0, 0, SIZE, SIZE, 8);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(0, 0, SIZE, SIZE, 8);
      ctx.stroke();

      const scale = SIZE / worldSize;
      const cx = SIZE / 2;
      const cy = SIZE / 2;

      // Stands
      standPositions.forEach((sp, i) => {
        const sx = cx + sp.x * scale;
        const sy = cy + sp.z * scale;
        const color = STAND_COLORS[i % STAND_COLORS.length];
        const isVisited = workshopIds[i] && visitedIds.includes(workshopIds[i]);

        ctx.fillStyle = color;
        ctx.fillRect(sx - 4, sy - 4, 8, 8);

        if (isVisited) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(sx - 5, sy - 5, 10, 10);
        }
      });

      // Remote players
      remotePlayers.forEach((p) => {
        const rx = cx + p.pos_x * scale;
        const ry = cy + p.pos_z * scale;
        ctx.fillStyle = '#475DFF';
        ctx.beginPath();
        ctx.arc(rx, ry, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Player
      const px = cx + playerX * scale;
      const py = cy + playerZ * scale;
      ctx.fillStyle = '#68D391';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    draw();
    const interval = setInterval(draw, 100);
    return () => clearInterval(interval);
  }, [playerX, playerZ, standPositions, visitedIds, workshopIds, remotePlayers]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="fixed bottom-4 right-4 z-50"
      style={{ width: SIZE, height: SIZE }}
    />
  );
}
