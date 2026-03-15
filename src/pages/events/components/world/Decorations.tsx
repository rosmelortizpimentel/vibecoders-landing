import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Birds ──────────────────────────────────────────────── */

interface BirdData {
  offset: number;
  speed: number;
  radiusX: number;
  radiusZ: number;
  y: number;
  cx: number;
  cz: number;
}

function Bird({ data }: { data: BirdData }) {
  const ref = useRef<THREE.Group>(null);
  const wingRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const t = Date.now() * 0.001 * data.speed + data.offset;
    ref.current.position.x = data.cx + Math.sin(t) * data.radiusX;
    ref.current.position.z = data.cz + Math.cos(t) * data.radiusZ;
    ref.current.position.y = data.y + Math.sin(t * 2) * 0.3;
    ref.current.rotation.y = Math.atan2(
      Math.cos(t) * data.radiusX * data.speed,
      -Math.sin(t) * data.radiusZ * data.speed,
    );
    if (wingRef.current) {
      wingRef.current.rotation.z = Math.sin(t * 8) * 0.6;
    }
  });

  return (
    <group ref={ref}>
      {/* body */}
      <mesh>
        <sphereGeometry args={[0.06, 6, 4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* wing */}
      <mesh ref={wingRef} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.18, 0.04]} />
        <meshStandardMaterial color="#64748B" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Birds({ worldSize }: { worldSize: number }) {
  const birds = useMemo<BirdData[]>(() => {
    const half = worldSize / 2;
    const count = Math.min(12, Math.max(5, Math.floor(worldSize / 4)));
    return Array.from({ length: count }, (_, i) => ({
      offset: i * 2.1,
      speed: 0.15 + Math.random() * 0.15,
      radiusX: 3 + Math.random() * (half * 0.6),
      radiusZ: 3 + Math.random() * (half * 0.6),
      y: 6 + Math.random() * 4,
      cx: (Math.random() - 0.5) * half * 0.5,
      cz: (Math.random() - 0.5) * half * 0.5,
    }));
  }, [worldSize]);

  return (
    <group>
      {birds.map((b, i) => (
        <Bird key={i} data={b} />
      ))}
    </group>
  );
}

/* ─── NPC Sheep ──────────────────────────────────────────── */

interface NPCData {
  id: number;
  color: string;
  startX: number;
  startZ: number;
  speed: number;
  radius: number;
  offset: number;
}

const NPC_COLORS = ['#94A3B8', '#A78BFA', '#FB923C', '#34D399', '#F472B6', '#60A5FA'];

function NPCSheep({ data }: { data: NPCData }) {
  const ref = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const t = Date.now() * 0.001 * data.speed + data.offset;
    const x = data.startX + Math.sin(t) * data.radius;
    const z = data.startZ + Math.cos(t * 0.7) * data.radius;
    ref.current.position.set(x, 0, z);
    ref.current.rotation.y = Math.atan2(
      Math.cos(t) * data.radius * data.speed,
      -Math.sin(t * 0.7) * data.radius * data.speed,
    );
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.28 + Math.sin(t * 4) * 0.02;
    }
  });

  return (
    <group ref={ref}>
      {/* body */}
      <mesh ref={bodyRef} position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.9} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.38, 0.16]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color={data.color} roughness={0.7} />
      </mesh>
      {/* legs */}
      {[[-0.08, 0, -0.06], [0.08, 0, -0.06], [-0.08, 0, 0.06], [0.08, 0, 0.06]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.025, 0.025, 0.18, 4]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
      ))}
    </group>
  );
}

export function NPCSheepGroup({ worldSize, standPositions }: { worldSize: number; standPositions: { x: number; z: number }[] }) {
  const npcs = useMemo<NPCData[]>(() => {
    const half = worldSize / 2;
    const count = Math.min(8, Math.max(3, Math.floor(worldSize / 5)));
    return Array.from({ length: count }, (_, i) => {
      // Place NPCs along the walkway, avoiding stands
      const z = (i / count) * (worldSize * 0.7) - worldSize * 0.2;
      const xSide = i % 2 === 0 ? -1 : 1;
      return {
        id: i,
        color: NPC_COLORS[i % NPC_COLORS.length],
        startX: xSide * (1 + Math.random() * 1.5),
        startZ: z,
        speed: 0.2 + Math.random() * 0.15,
        radius: 1.5 + Math.random() * 2,
        offset: i * 3.7,
      };
    });
  }, [worldSize]);

  return (
    <group>
      {npcs.map((n) => (
        <NPCSheep key={n.id} data={n} />
      ))}
    </group>
  );
}

/* ─── Vegetation ─────────────────────────────────────────── */

interface TreeData {
  x: number;
  z: number;
  scale: number;
  trunkColor: string;
  leafColor: string;
  type: 'round' | 'cone' | 'bush';
}

function Tree({ data }: { data: TreeData }) {
  const s = data.scale;
  if (data.type === 'bush') {
    return (
      <group position={[data.x, 0, data.z]}>
        <mesh position={[0, 0.18 * s, 0]}>
          <sphereGeometry args={[0.35 * s, 8, 6]} />
          <meshStandardMaterial color={data.leafColor} roughness={0.85} />
        </mesh>
        <mesh position={[0.2 * s, 0.12 * s, 0.15 * s]}>
          <sphereGeometry args={[0.22 * s, 6, 5]} />
          <meshStandardMaterial color={data.leafColor} roughness={0.85} />
        </mesh>
      </group>
    );
  }
  if (data.type === 'cone') {
    return (
      <group position={[data.x, 0, data.z]}>
        <mesh position={[0, 0.3 * s, 0]}>
          <cylinderGeometry args={[0.03 * s, 0.06 * s, 0.6 * s, 6]} />
          <meshStandardMaterial color={data.trunkColor} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.85 * s, 0]}>
          <coneGeometry args={[0.3 * s, 0.8 * s, 6]} />
          <meshStandardMaterial color={data.leafColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.25 * s, 0]}>
          <coneGeometry args={[0.2 * s, 0.5 * s, 6]} />
          <meshStandardMaterial color={data.leafColor} roughness={0.8} />
        </mesh>
      </group>
    );
  }
  // round tree
  return (
    <group position={[data.x, 0, data.z]}>
      <mesh position={[0, 0.4 * s, 0]}>
        <cylinderGeometry args={[0.05 * s, 0.07 * s, 0.8 * s, 6]} />
        <meshStandardMaterial color={data.trunkColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.0 * s, 0]}>
        <sphereGeometry args={[0.4 * s, 8, 6]} />
        <meshStandardMaterial color={data.leafColor} roughness={0.8} />
      </mesh>
    </group>
  );
}

function GrassPatch({ x, z, size }: { x: number; z: number; size: number }) {
  return (
    <mesh position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[size, 8]} />
      <meshStandardMaterial color="#86EFAC" roughness={0.9} transparent opacity={0.5} />
    </mesh>
  );
}

function FlowerBed({ x, z }: { x: number; z: number }) {
  const colors = ['#FB7185', '#FBBF24', '#A78BFA', '#34D399'];
  return (
    <group position={[x, 0, z]}>
      {colors.map((c, i) => {
        const angle = (i / colors.length) * Math.PI * 2;
        const r = 0.2;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0.08, Math.sin(angle) * r]}>
            <sphereGeometry args={[0.05, 5, 4]} />
            <meshStandardMaterial color={c} />
          </mesh>
        );
      })}
    </group>
  );
}

const LEAF_COLORS = ['#22C55E', '#16A34A', '#4ADE80', '#15803D', '#86EFAC'];
const TRUNK_COLORS = ['#78350F', '#92400E', '#A16207'];

export function Vegetation({ worldSize, standPositions }: { worldSize: number; standPositions: { x: number; z: number }[] }) {
  const elements = useMemo(() => {
    const half = worldSize / 2;
    const trees: TreeData[] = [];
    const grasses: { x: number; z: number; size: number }[] = [];
    const flowers: { x: number; z: number }[] = [];

    const rng = (seed: number) => {
      let s = seed;
      return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
    };
    const rand = rng(42);

    // Trees along the outer edges and between stands
    const treeCount = Math.min(40, Math.max(12, Math.floor(worldSize * 1.5)));
    for (let i = 0; i < treeCount; i++) {
      const x = (rand() - 0.5) * (worldSize - 2);
      const z = (rand() - 0.5) * (worldSize - 2);

      // Skip if too close to walkway center or a stand
      if (Math.abs(x) < 2.5) continue;
      const tooClose = standPositions.some(
        (sp) => Math.abs(sp.x - x) < 3 && Math.abs(sp.z - z) < 3,
      );
      if (tooClose) continue;

      const types: TreeData['type'][] = ['round', 'cone', 'bush'];
      trees.push({
        x,
        z,
        scale: 0.7 + rand() * 0.8,
        trunkColor: TRUNK_COLORS[Math.floor(rand() * TRUNK_COLORS.length)],
        leafColor: LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)],
        type: types[Math.floor(rand() * types.length)],
      });
    }

    // Grass patches
    const grassCount = Math.min(25, Math.floor(worldSize));
    for (let i = 0; i < grassCount; i++) {
      const x = (rand() - 0.5) * (worldSize - 4);
      const z = (rand() - 0.5) * (worldSize - 4);
      if (Math.abs(x) < 2) continue;
      grasses.push({ x, z, size: 0.4 + rand() * 0.6 });
    }

    // Flower beds near stands
    for (const sp of standPositions) {
      if (rand() > 0.5) {
        const side = sp.x > 0 ? 1 : -1;
        flowers.push({ x: sp.x + side * 2.2, z: sp.z + (rand() - 0.5) * 2 });
      }
    }

    return { trees, grasses, flowers };
  }, [worldSize, standPositions]);

  return (
    <group>
      {elements.trees.map((t, i) => (
        <Tree key={`t${i}`} data={t} />
      ))}
      {elements.grasses.map((g, i) => (
        <GrassPatch key={`g${i}`} x={g.x} z={g.z} size={g.size} />
      ))}
      {elements.flowers.map((f, i) => (
        <FlowerBed key={`f${i}`} x={f.x} z={f.z} />
      ))}
    </group>
  );
}
