import { useState, useEffect, useCallback, Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STAND_COLORS, generatePathPositions, getWorldSize } from '../constants';
import type { Workshop, AvatarConfig, RemotePlayer } from '../types';
import { Ground } from './world/Ground';
import { Stand } from './world/Stand';
import { Barriers } from './world/Barriers';
import { IsometricCamera } from './world/IsometricCamera';
import { SheepModel } from './sheep/SheepModel';
import { RemotePlayers } from './multiplayer/RemotePlayers';
import { HUD } from './hud/HUD';
import { Minimap } from './hud/Minimap';
import { VirtualJoystick } from './ui/VirtualJoystick';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import { Birds, NPCSheepGroup, Vegetation } from './world/Decorations';

interface FairWorldProps {
  workshops: Workshop[];
  avatar: AvatarConfig;
  name: string;
  deviceId: string;
  visitedIds: string[];
  remotePlayers: Map<string, RemotePlayer>;
  onPublishPosition: (x: number, z: number, heading: number) => void;
  onEnterStand: (index: number) => void;
  onEditAvatar: () => void;
  isMobile: boolean;
}

function Walkway({ standPositions }: { standPositions: { x: number; z: number }[] }) {
  const pathMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.8 }), []);
  const dotMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#94A3B8', roughness: 0.5 }), []);

  if (standPositions.length === 0) return null;

  const minZ = Math.min(...standPositions.map((p) => p.z)) - 3;
  const maxZ = Math.max(...standPositions.map((p) => p.z)) + 3;
  const pathLen = maxZ - minZ;
  const centerZ = (minZ + maxZ) / 2;

  // Dots along the center walkway
  const dots: number[] = [];
  for (let z = minZ; z <= maxZ; z += 1.2) {
    dots.push(z);
  }

  return (
    <group>
      {/* Central walkway strip */}
      <mesh position={[0, 0.005, centerZ]} rotation={[-Math.PI / 2, 0, 0]} material={pathMat}>
        <planeGeometry args={[3.2, pathLen]} />
      </mesh>

      {/* Dashed center line dots */}
      {dots.map((z, i) => (
        <mesh key={i} position={[0, 0.015, z]} rotation={[-Math.PI / 2, 0, 0]} material={dotMat}>
          <planeGeometry args={[0.15, 0.5]} />
        </mesh>
      ))}

      {/* Connector arms from walkway to each stand */}
      {standPositions.map((sp, i) => {
        const armLen = Math.abs(sp.x) - 1.6;
        const armX = sp.x > 0 ? 1.6 + armLen / 2 : -1.6 - armLen / 2;
        return (
          <mesh key={i} position={[armX, 0.006, sp.z]} rotation={[-Math.PI / 2, 0, 0]} material={pathMat}>
            <planeGeometry args={[armLen, 1.2]} />
          </mesh>
        );
      })}
    </group>
  );
}

function WorldScene({
  workshops,
  avatar,
  name,
  visitedIds,
  remotePlayers,
  onPublishPosition,
  onEnterStand,
  onEditAvatar,
  playerPosRef,
  joystickRef,
  onStepsChange,
  standPositions,
  worldSize,
}: {
  workshops: Workshop[];
  avatar: AvatarConfig;
  name: string;
  visitedIds: string[];
  remotePlayers: Map<string, RemotePlayer>;
  onPublishPosition: (x: number, z: number, heading: number) => void;
  onEnterStand: (index: number) => void;
  onEditAvatar: () => void;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  joystickRef: React.MutableRefObject<(x: number, y: number) => void>;
  onStepsChange: (steps: number) => void;
  standPositions: { x: number; z: number }[];
  worldSize: number;
}) {
  const [nearStand, setNearStand] = useState<number | null>(null);
  const enterCooldownRef = useRef(0);

  const handleNearStand = useCallback((idx: number | null) => {
    setNearStand(idx);
  }, []);

  const { posRef, headingRef, isMovingRef, bobRef, steps, setJoystick } = usePlayerMovement({
    standPositions,
    onNearStand: handleNearStand,
    worldSize,
  });

  // Auto-enter stand on proximity (with cooldown)
  useEffect(() => {
    if (nearStand !== null && Date.now() > enterCooldownRef.current) {
      enterCooldownRef.current = Date.now() + 2000;
      onEnterStand(nearStand);
    }
  }, [nearStand, onEnterStand]);

  // Expose joystick setter to parent
  joystickRef.current = setJoystick;

  // Sync player position ref for camera and external use
  playerPosRef.current = posRef.current;

  // Report steps to parent
  useEffect(() => { onStepsChange(steps); }, [steps, onStepsChange]);

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} color="#e0e7ff" />
      <hemisphereLight args={['#dbeafe', '#f0fdf4', 0.4]} />
      <fog attach="fog" args={['#F1F5F9', 25, 60]} />

      <IsometricCamera targetRef={posRef as any} />
      <PresencePublisher posRef={posRef} headingRef={headingRef} onPublish={onPublishPosition} />

      <Ground worldSize={worldSize} />
      <Barriers worldSize={worldSize} />

      {/* Central walkway path strip */}
      <Walkway standPositions={standPositions} />

      {/* Stands */}
      {workshops.map((w, i) => {
        const sp = standPositions[i];
        return (
          <Stand
            key={w.id}
            workshop={w}
            position={[sp.x, 0, sp.z]}
            color={STAND_COLORS[i % STAND_COLORS.length]}
            isNear={nearStand === i}
            isVisited={visitedIds.includes(w.id)}
            visitors={Array.from(remotePlayers.values()).filter((p) => p.current_stand_id === w.id)}
          />
        );
      })}

      {/* Local player — click to edit avatar */}
      <PlayerSheep
        avatar={avatar}
        name={name}
        posRef={posRef}
        headingRef={headingRef}
        isMovingRef={isMovingRef}
        bobRef={bobRef}
        onClick={onEditAvatar}
      />

      {/* Remote players */}
      <RemotePlayers players={remotePlayers} localPos={posRef as any} />

      {/* Decorations */}
      <Birds worldSize={worldSize} />
      <NPCSheepGroup worldSize={worldSize} standPositions={standPositions} />
      <Vegetation worldSize={worldSize} standPositions={standPositions} />
    </>
  );
}

function PresencePublisher({
  posRef,
  headingRef,
  onPublish,
}: {
  posRef: React.MutableRefObject<THREE.Vector3>;
  headingRef: React.MutableRefObject<number>;
  onPublish: (x: number, z: number, heading: number) => void;
}) {
  const lastRef = useRef(0);
  useFrame(() => {
    const now = Date.now();
    if (now - lastRef.current > 100) {
      lastRef.current = now;
      onPublish(posRef.current.x, posRef.current.z, headingRef.current);
    }
  });
  return null;
}

function PlayerSheep({
  avatar,
  name,
  posRef,
  headingRef,
  isMovingRef,
  bobRef,
  onClick,
}: {
  avatar: AvatarConfig;
  name: string;
  posRef: React.MutableRefObject<THREE.Vector3>;
  headingRef: React.MutableRefObject<number>;
  isMovingRef: React.MutableRefObject<boolean>;
  bobRef: React.MutableRefObject<number>;
  onClick?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = posRef.current.x;
      groupRef.current.position.z = posRef.current.z;
      groupRef.current.rotation.y = headingRef.current;
    }
    if (bodyRef.current) {
      const moving = isMovingRef.current;
      const bob = bobRef.current;
      const bobVal = moving ? Math.sin(bob) * 0.06 : Math.sin(Date.now() * 0.002) * 0.01;
      bodyRef.current.position.y = bobVal;
      bodyRef.current.rotation.z = moving ? Math.sin(bob * 0.5) * 0.04 : 0;
    }
  });

  return (
    <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      <group ref={bodyRef} scale={0.8}>
        <SheepModel
          avatar={avatar}
          name={name}
          rotation={0}
          isMoving={false}
          bob={0}
          showName
          scale={1}
        />
      </group>
    </group>
  );
}

export function FairWorld({
  workshops,
  avatar,
  name,
  deviceId,
  visitedIds,
  remotePlayers,
  onPublishPosition,
  onEnterStand,
  onEditAvatar,
  isMobile,
}: FairWorldProps) {
  const playerPosRef = useRef(new THREE.Vector3());
  const joystickRef = useRef<(x: number, y: number) => void>(() => {});
  const [playerXZ, setPlayerXZ] = useState({ x: 0, z: 0 });
  const [steps, setSteps] = useState(0);

  const standPositions = useMemo(() => generatePathPositions(workshops.length), [workshops.length]);
  const worldSize = useMemo(() => getWorldSize(workshops.length), [workshops.length]);

  // Update HUD player position periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerXZ({ x: playerPosRef.current.x, z: playerPosRef.current.z });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const pixelRatio: [number, number] = isMobile ? [1, 1.5] : [1, 2];

  return (
    <div className="fixed inset-0 z-0" style={{ background: '#F1F5F9' }}>
      <Canvas
        dpr={pixelRatio}
        camera={{ fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: !isMobile }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <WorldScene
            workshops={workshops}
            avatar={avatar}
            name={name}
            visitedIds={visitedIds}
            remotePlayers={remotePlayers}
            onPublishPosition={onPublishPosition}
            onEnterStand={onEnterStand}
            onEditAvatar={onEditAvatar}
            playerPosRef={playerPosRef}
            joystickRef={joystickRef}
            onStepsChange={setSteps}
            standPositions={standPositions}
            worldSize={worldSize}
          />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <HUD
        steps={steps}
        visitedCount={visitedIds.length}
        totalStands={workshops.length}
        isMobile={isMobile}
      />

      {/* Minimap */}
      <Minimap
        playerX={playerXZ.x}
        playerZ={playerXZ.z}
        standPositions={standPositions}
        visitedIds={visitedIds}
        workshopIds={workshops.map((w) => w.id)}
        remotePlayers={remotePlayers}
        worldSize={worldSize}
      />

      {/* Mobile joystick */}
      {isMobile && (
        <VirtualJoystick onMove={(x, y) => joystickRef.current(x, y)} />
      )}
    </div>
  );
}
