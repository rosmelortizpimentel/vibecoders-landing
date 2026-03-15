import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AvatarConfig } from '../../types';
import { SheepAccessories } from './SheepAccessories';
import { SheepNameTag } from './SheepNameTag';

interface SheepModelProps {
  avatar: AvatarConfig;
  name?: string;
  position?: [number, number, number];
  rotation?: number;
  isMoving?: boolean;
  bob?: number;
  showName?: boolean;
  scale?: number;
  isSpeaker?: boolean;
  speakerVolume?: number;
}

export function SheepModel({
  avatar,
  name,
  position = [0, 0, 0],
  rotation = 0,
  isMoving = false,
  bob = 0,
  showName = true,
  scale = 1,
  isSpeaker = false,
  speakerVolume = 0,
}: SheepModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  const faceColor = '#3a3a3a';
  const hoodieColor = avatar.hoodie;

  const hoodieMat = useMemo(() => new THREE.MeshStandardMaterial({ color: hoodieColor, roughness: 0.5 }), [hoodieColor]);
  const faceMat = useMemo(() => new THREE.MeshStandardMaterial({ color: faceColor, roughness: 0.7 }), []);
  const woolMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2d2d2d', roughness: 0.85 }), []);
  const eyeWhiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 }), []);
  const eyePupilMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a1a' }), []);
  const noseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2a2a' }), []);
  const mouthMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#222222' }), []);

  useFrame(() => {
    if (!groupRef.current) return;

    if (isSpeaker) {
      const v = speakerVolume;
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.02 + v * 0.05;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(Date.now() * 0.002) * 0.15;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(Date.now() * 0.005) * v * 1.2 - 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(Date.now() * 0.005 + 2) * v * 1.2 - 0.1;
      }
      if (mouthRef.current) {
        mouthRef.current.scale.y = 0.5 + v * 1.5;
      }
    } else {
      if (bodyRef.current) {
        const bobVal = isMoving ? Math.sin(bob) * 0.06 : Math.sin(Date.now() * 0.002) * 0.01;
        bodyRef.current.position.y = bobVal;
        bodyRef.current.rotation.z = isMoving ? Math.sin(bob * 0.5) * 0.04 : 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={scale}>
      <group ref={bodyRef}>
        {/* === TORSO / HOODIE — blocky LEGO brick === */}
        <mesh material={hoodieMat} position={[0, 0.42, 0]}>
          <boxGeometry args={[0.6, 0.52, 0.36]} />
        </mesh>
        {/* Hoodie collar */}
        <mesh material={hoodieMat} position={[0, 0.7, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.3]} />
        </mesh>
        {/* Hoodie pocket */}
        <mesh position={[0, 0.3, 0.185]}>
          <boxGeometry args={[0.32, 0.1, 0.01]} />
          <meshStandardMaterial color={hoodieColor} roughness={0.4} />
        </mesh>
        {/* Drawstrings */}
        <mesh position={[-0.05, 0.66, 0.17]}>
          <boxGeometry args={[0.015, 0.1, 0.015]} />
          <meshStandardMaterial color="#eeeeee" />
        </mesh>
        <mesh position={[0.05, 0.66, 0.17]}>
          <boxGeometry args={[0.015, 0.1, 0.015]} />
          <meshStandardMaterial color="#eeeeee" />
        </mesh>

        {/* === HEAD — blocky LEGO minifig head === */}
        <group ref={headRef} position={[0, 0.95, 0]}>
          {/* Face block */}
          <mesh material={faceMat}>
            <boxGeometry args={[0.44, 0.44, 0.4]} />
          </mesh>

          {/* Wool hair on top — blocky stepped layers */}
          <mesh material={woolMat} position={[0, 0.26, 0]}>
            <boxGeometry args={[0.46, 0.08, 0.42]} />
          </mesh>
          <mesh material={woolMat} position={[0, 0.32, -0.02]}>
            <boxGeometry args={[0.38, 0.06, 0.34]} />
          </mesh>
          <mesh material={woolMat} position={[0, 0.36, -0.04]}>
            <boxGeometry args={[0.28, 0.04, 0.26]} />
          </mesh>

          {/* Ears — flat LEGO tabs */}
          <mesh material={faceMat} position={[-0.27, 0.02, 0]}>
            <boxGeometry args={[0.08, 0.14, 0.1]} />
          </mesh>
          <mesh material={faceMat} position={[0.27, 0.02, 0]}>
            <boxGeometry args={[0.08, 0.14, 0.1]} />
          </mesh>

          {/* Eyes — flat white blocks with dark pupil */}
          <mesh material={eyeWhiteMat} position={[-0.1, 0.06, 0.205]}>
            <boxGeometry args={[0.1, 0.1, 0.02]} />
          </mesh>
          <mesh material={eyePupilMat} position={[-0.1, 0.06, 0.22]}>
            <boxGeometry args={[0.05, 0.06, 0.01]} />
          </mesh>
          {/* Eye shine */}
          <mesh position={[-0.08, 0.08, 0.225]}>
            <boxGeometry args={[0.02, 0.02, 0.005]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>

          <mesh material={eyeWhiteMat} position={[0.1, 0.06, 0.205]}>
            <boxGeometry args={[0.1, 0.1, 0.02]} />
          </mesh>
          <mesh material={eyePupilMat} position={[0.1, 0.06, 0.22]}>
            <boxGeometry args={[0.05, 0.06, 0.01]} />
          </mesh>
          <mesh position={[0.12, 0.08, 0.225]}>
            <boxGeometry args={[0.02, 0.02, 0.005]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>

          {/* Nose — small protruding block */}
          <mesh material={noseMat} position={[0, -0.04, 0.22]}>
            <boxGeometry args={[0.08, 0.05, 0.04]} />
          </mesh>

          {/* Mouth */}
          <mesh ref={mouthRef} material={mouthMat} position={[0, -0.13, 0.205]}>
            <boxGeometry args={[0.14, 0.025, 0.01]} />
          </mesh>

          {/* Accessories */}
          <SheepAccessories avatar={avatar} />
        </group>

        {/* === ARMS — blocky LEGO cylinders === */}
        <mesh ref={leftArmRef} material={hoodieMat} position={[-0.38, 0.48, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.12, 0.36, 0.14]} />
        </mesh>
        <mesh ref={rightArmRef} material={hoodieMat} position={[0.38, 0.48, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.12, 0.36, 0.14]} />
        </mesh>

        {/* Hands — small dark blocks */}
        <mesh material={faceMat} position={[-0.4, 0.26, 0]}>
          <boxGeometry args={[0.09, 0.09, 0.09]} />
        </mesh>
        <mesh material={faceMat} position={[0.4, 0.26, 0]}>
          <boxGeometry args={[0.09, 0.09, 0.09]} />
        </mesh>

        {/* === LEGS — stubby LEGO legs === */}
        <mesh material={faceMat} position={[-0.13, 0.08, 0]}>
          <boxGeometry args={[0.16, 0.16, 0.18]} />
        </mesh>
        <mesh material={faceMat} position={[0.13, 0.08, 0]}>
          <boxGeometry args={[0.16, 0.16, 0.18]} />
        </mesh>
        {/* Feet — slightly wider */}
        <mesh material={faceMat} position={[-0.13, 0.01, 0.03]}>
          <boxGeometry args={[0.16, 0.02, 0.22]} />
        </mesh>
        <mesh material={faceMat} position={[0.13, 0.01, 0.03]}>
          <boxGeometry args={[0.16, 0.02, 0.22]} />
        </mesh>

        {/* Microphone for speaker */}
        {isSpeaker && (
          <group position={[0.48, 0.5, 0.08]}>
            <mesh>
              <boxGeometry args={[0.03, 0.16, 0.03]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.05, 0.05, 0.05]} />
              <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        )}
      </group>

      {/* Name tag */}
      {showName && name && <SheepNameTag name={name} />}
    </group>
  );
}
