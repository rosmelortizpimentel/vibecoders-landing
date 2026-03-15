import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';
import { createStandRoofTexture } from '../../utils/canvasTexture';
import { SheepModel } from '../sheep/SheepModel';
import type { Workshop, AvatarConfig, RemotePlayer } from '../../types';
import { format } from 'date-fns';

interface StandProps {
  workshop: Workshop;
  position: [number, number, number];
  color: string;
  isNear: boolean;
  isVisited: boolean;
  visitors?: RemotePlayer[];
}

function SpeakerPhoto({ url, position, rotation }: { url: string; position: [number, number, number]; rotation?: [number, number, number] }) {
  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [url]);

  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]}>
      <planeGeometry args={[0.8, 0.8]} />
      <meshStandardMaterial map={texture} transparent />
    </mesh>
  );
}

export function Stand({ workshop, position, color, isNear, isVisited, visitors = [] }: StandProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const starRef = useRef<THREE.Mesh>(null);

  const speakerName = workshop.speakers.map((s) => s.display_name).join(', ') || 'TBA';
  const dateStr = workshop.scheduled_at
    ? format(new Date(workshop.scheduled_at), 'MMM d, yyyy')
    : 'Date TBA';
  const speakerPhoto = workshop.speakers[0]?.photo_url || null;

  const roofTexture = useMemo(() => {
    return createStandRoofTexture(workshop.title, speakerName, dateStr, color);
  }, [workshop.title, speakerName, dateStr, color]);

  const colorObj = useMemo(() => new THREE.Color(color), [color]);
  const platformMat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.6 }), [color]);
  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
    [color],
  );
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.5 }), [color]);

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.visible = isNear;
      if (isNear) {
        const s = 1 + Math.sin(Date.now() * 0.005) * 0.1;
        ringRef.current.scale.set(s, 1, s);
      }
    }
    if (starRef.current) {
      starRef.current.visible = isVisited;
      if (isVisited) {
        starRef.current.position.y = 3.8 + Math.sin(Date.now() * 0.003) * 0.15;
        starRef.current.rotation.y += 0.02;
      }
    }
  });

  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, 0.05, 0]} material={platformMat}>
        <boxGeometry args={[2.8, 0.12, 2.8]} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.25, -1.3]} material={wallMat}>
        <boxGeometry args={[2.8, 2.3, 0.05]} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-1.3, 1.25, 0]} material={wallMat}>
        <boxGeometry args={[0.05, 2.3, 2.8]} />
      </mesh>

      {/* Right wall */}
      <mesh position={[1.3, 1.25, 0]} material={wallMat}>
        <boxGeometry args={[0.05, 2.3, 2.8]} />
      </mesh>

      {/* Roof slab */}
      <mesh position={[0, 2.45, 0]} material={roofMat}>
        <boxGeometry args={[3.0, 0.08, 3.0]} />
      </mesh>

      {/* Roof-top info panel (facing upward, visible from isometric camera) */}
      <mesh position={[0, 2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 2.8]} />
        <meshStandardMaterial map={roofTexture} transparent />
      </mesh>

      {/* Speaker photo on ROOF (top-right area, facing up) */}
      {speakerPhoto && (
        <SpeakerPhoto url={speakerPhoto} position={[0.85, 2.52, 0.7]} rotation={[-Math.PI / 2, 0, 0]} />
      )}

      {/* Speaker photo on back wall */}
      {speakerPhoto && (
        <SpeakerPhoto url={speakerPhoto} position={[0, 1.5, -1.24]} />
      )}

      {/* Speaker name on back wall */}
      <Billboard position={[0, 0.7, -1.2]}>
        <Text fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle" maxWidth={2} font={undefined}>
          {speakerName}
        </Text>
      </Billboard>

      {/* Speaker sheep avatar with microphone (center-back of stand) */}
      <SheepModel
        avatar={{ hoodie: color, glasses: 'none', hat: 'none', gender: 'm' }}
        name={speakerName}
        position={[0, 0.12, -0.6]}
        rotation={0}
        showName={false}
        scale={0.45}
        isSpeaker
        speakerVolume={0}
      />

      {/* Visitors currently inside this stand */}
      {visitors.slice(0, 4).map((v, vi) => {
        const angle = ((vi + 1) / (Math.min(visitors.length, 4) + 1)) * Math.PI - Math.PI / 2;
        const vx = Math.sin(angle) * 0.7;
        const vz = Math.cos(angle) * 0.5 + 0.3;
        return (
          <SheepModel
            key={v.device_id}
            avatar={v.avatar}
            name={v.name}
            position={[vx, 0.12, vz]}
            rotation={Math.PI}
            showName
            scale={0.3}
          />
        );
      })}
      {visitors.length > 4 && (
        <Billboard position={[0, 1.8, 0.8]}>
          <Text fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" font={undefined}>
            +{visitors.length - 4}
          </Text>
        </Billboard>
      )}

      {/* Stand light */}
      <pointLight position={[0, 2.2, 0]} color={colorObj} intensity={0.6} distance={5} />

      {/* Proximity ring */}
      <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[1.6, 1.8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Visited star */}
      <mesh ref={starRef} position={[0, 3.8, 0]} visible={false}>
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
