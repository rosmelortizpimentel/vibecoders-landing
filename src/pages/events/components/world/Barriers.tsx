import { useMemo } from 'react';
import * as THREE from 'three';

interface BarriersProps {
  worldSize: number;
}

export function Barriers({ worldSize }: BarriersProps) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.6 }), []);
  const half = worldSize / 2;
  const h = 0.6;
  const postSpacing = 2;
  const posts: [number, number, number][] = [];

  for (let i = -half; i <= half; i += postSpacing) {
    posts.push([i, h / 2, -half]);
    posts.push([i, h / 2, half]);
    posts.push([-half, h / 2, i]);
    posts.push([half, h / 2, i]);
  }

  return (
    <group>
      {/* Rails */}
      <mesh position={[0, h * 0.7, -half]} material={mat}>
        <boxGeometry args={[worldSize, 0.05, 0.05]} />
      </mesh>
      <mesh position={[0, h * 0.4, -half]} material={mat}>
        <boxGeometry args={[worldSize, 0.05, 0.05]} />
      </mesh>
      <mesh position={[0, h * 0.7, half]} material={mat}>
        <boxGeometry args={[worldSize, 0.05, 0.05]} />
      </mesh>
      <mesh position={[0, h * 0.4, half]} material={mat}>
        <boxGeometry args={[worldSize, 0.05, 0.05]} />
      </mesh>
      <mesh position={[-half, h * 0.7, 0]} material={mat}>
        <boxGeometry args={[0.05, 0.05, worldSize]} />
      </mesh>
      <mesh position={[-half, h * 0.4, 0]} material={mat}>
        <boxGeometry args={[0.05, 0.05, worldSize]} />
      </mesh>
      <mesh position={[half, h * 0.7, 0]} material={mat}>
        <boxGeometry args={[0.05, 0.05, worldSize]} />
      </mesh>
      <mesh position={[half, h * 0.4, 0]} material={mat}>
        <boxGeometry args={[0.05, 0.05, worldSize]} />
      </mesh>

      {/* Posts */}
      {posts.map((pos, i) => (
        <mesh key={i} position={pos} material={mat}>
          <boxGeometry args={[0.08, h, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}
