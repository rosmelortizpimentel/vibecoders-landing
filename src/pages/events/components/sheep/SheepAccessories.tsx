import { useMemo } from 'react';
import * as THREE from 'three';
import type { AvatarConfig } from '../../types';

interface SheepAccessoriesProps {
  avatar: AvatarConfig;
}

export function SheepAccessories({ avatar }: SheepAccessoriesProps) {
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a1a' }), []);
  const lensPixelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c0d8ff', emissive: '#6688cc', emissiveIntensity: 0.15 }), []);
  const lensRoundMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#88bbff', transparent: true, opacity: 0.45 }), []);
  const hatMat = useMemo(() => new THREE.MeshStandardMaterial({ color: avatar.hoodie, roughness: 0.5 }), [avatar.hoodie]);
  const pomMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#eeeeee' }), []);
  const lashMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a1a' }), []);
  const bowMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#E85D9A' }), []);

  return (
    <>
      {/* Pixel glasses — blocky LEGO visor */}
      {avatar.glasses === 'pixel' && (
        <group position={[0, 0.06, 0.2]}>
          <mesh material={frameMat} position={[-0.1, 0, 0.02]}>
            <boxGeometry args={[0.12, 0.07, 0.03]} />
          </mesh>
          <mesh material={frameMat} position={[0.1, 0, 0.02]}>
            <boxGeometry args={[0.12, 0.07, 0.03]} />
          </mesh>
          <mesh material={frameMat} position={[0, 0, 0.02]}>
            <boxGeometry args={[0.04, 0.03, 0.03]} />
          </mesh>
          <mesh material={lensPixelMat} position={[-0.1, 0, 0.04]}>
            <boxGeometry args={[0.09, 0.045, 0.01]} />
          </mesh>
          <mesh material={lensPixelMat} position={[0.1, 0, 0.04]}>
            <boxGeometry args={[0.09, 0.045, 0.01]} />
          </mesh>
        </group>
      )}

      {/* Round glasses — blocky octagonal style */}
      {avatar.glasses === 'round' && (
        <group position={[0, 0.06, 0.2]}>
          <mesh material={frameMat} position={[-0.1, 0, 0.02]}>
            <boxGeometry args={[0.13, 0.1, 0.02]} />
          </mesh>
          <mesh material={frameMat} position={[0.1, 0, 0.02]}>
            <boxGeometry args={[0.13, 0.1, 0.02]} />
          </mesh>
          <mesh material={frameMat} position={[0, 0, 0.02]}>
            <boxGeometry args={[0.04, 0.02, 0.02]} />
          </mesh>
          <mesh material={lensRoundMat} position={[-0.1, 0, 0.035]}>
            <boxGeometry args={[0.1, 0.08, 0.005]} />
          </mesh>
          <mesh material={lensRoundMat} position={[0.1, 0, 0.035]}>
            <boxGeometry args={[0.1, 0.08, 0.005]} />
          </mesh>
        </group>
      )}

      {/* Beanie — stacked LEGO blocks */}
      {avatar.hat === 'beanie' && (
        <group position={[0, 0.22, 0]}>
          <mesh material={hatMat} position={[0, 0.04, 0]}>
            <boxGeometry args={[0.48, 0.06, 0.44]} />
          </mesh>
          <mesh material={hatMat} position={[0, 0.1, 0]}>
            <boxGeometry args={[0.44, 0.06, 0.4]} />
          </mesh>
          <mesh material={hatMat} position={[0, 0.16, 0]}>
            <boxGeometry args={[0.36, 0.06, 0.34]} />
          </mesh>
          <mesh material={hatMat} position={[0, 0.22, 0]}>
            <boxGeometry args={[0.26, 0.06, 0.26]} />
          </mesh>
          {/* Pom pom block */}
          <mesh material={pomMat} position={[0, 0.28, 0]}>
            <boxGeometry args={[0.1, 0.06, 0.1]} />
          </mesh>
        </group>
      )}

      {/* Cap — flat LEGO cap */}
      {avatar.hat === 'cap' && (
        <group position={[0, 0.22, 0]}>
          <mesh material={hatMat} position={[0, 0.04, 0]}>
            <boxGeometry args={[0.48, 0.06, 0.44]} />
          </mesh>
          <mesh material={hatMat} position={[0, 0.1, 0]}>
            <boxGeometry args={[0.44, 0.06, 0.4]} />
          </mesh>
          {/* Visor — flat block */}
          <mesh material={hatMat} position={[0, 0.02, 0.26]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[0.36, 0.03, 0.2]} />
          </mesh>
        </group>
      )}

      {/* Feminine style: eyelashes + bow — all blocky */}
      {avatar.gender === 'f' && (
        <>
          {/* Left eyelashes */}
          {[-0.03, 0, 0.03].map((ox, i) => (
            <mesh key={`ll${i}`} material={lashMat} position={[-0.1 + ox, 0.14, 0.21]}>
              <boxGeometry args={[0.015, 0.03, 0.01]} />
            </mesh>
          ))}
          {/* Right eyelashes */}
          {[-0.03, 0, 0.03].map((ox, i) => (
            <mesh key={`rl${i}`} material={lashMat} position={[0.1 + ox, 0.14, 0.21]}>
              <boxGeometry args={[0.015, 0.03, 0.01]} />
            </mesh>
          ))}
          {/* Bow — two angled blocks + center */}
          <group position={[0.2, 0.3, 0]}>
            <mesh material={bowMat} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.08, 0.04, 0.04]} />
            </mesh>
            <mesh material={bowMat} position={[0.05, 0, 0]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.08, 0.04, 0.04]} />
            </mesh>
            <mesh material={bowMat}>
              <boxGeometry args={[0.03, 0.03, 0.03]} />
            </mesh>
          </group>
        </>
      )}
    </>
  );
}
