import { useRef, useCallback, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLAYER_SPEED, STAND_INTERACT_DISTANCE, STEP_INCREMENT_INTERVAL } from '../constants';
import type { StandPosition } from '../types';

interface UsePlayerMovementProps {
  standPositions: StandPosition[];
  onNearStand: (index: number | null) => void;
  worldSize: number;
}

export function usePlayerMovement({ standPositions, onNearStand, worldSize }: UsePlayerMovementProps) {
  const posRef = useRef(new THREE.Vector3(0, 0, 0));
  const headingRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const joystickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMovingRef = useRef(false);
  const [steps, setSteps] = useState(() => {
    try {
      return parseInt(localStorage.getItem('vbc_fair_steps') || '0', 10);
    } catch { return 0; }
  });
  const stepTimerRef = useRef(0);
  const bobRef = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysRef.current.add(key);
      }
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const setJoystick = useCallback((x: number, y: number) => {
    joystickRef.current = { x, y };
  }, []);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    const joy = joystickRef.current;
    let dx = 0;
    let dz = 0;

    if (keys.has('w') || keys.has('arrowup')) dz -= 1;
    if (keys.has('s') || keys.has('arrowdown')) dz += 1;
    if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
    if (keys.has('d') || keys.has('arrowright')) dx += 1;

    dx += joy.x;
    dz += joy.y;

    const len = Math.sqrt(dx * dx + dz * dz);
    const moving = len > 0.1;
    isMovingRef.current = moving;

    if (moving) {
      const nx = dx / len;
      const nz = dz / len;
      const speed = PLAYER_SPEED * delta;

      let newX = posRef.current.x + nx * speed;
      let newZ = posRef.current.z + nz * speed;

      const half = worldSize / 2 - 0.5;
      newX = Math.max(-half, Math.min(half, newX));
      newZ = Math.max(-half, Math.min(half, newZ));

      for (const sp of standPositions) {
        const sdx = newX - sp.x;
        const sdz = newZ - sp.z;
        if (Math.abs(sdx) < 1.5 && Math.abs(sdz) < 1.5) {
          if (Math.abs(sdx) > Math.abs(sdz)) {
            newX = sp.x + Math.sign(sdx) * 1.5;
          } else {
            newZ = sp.z + Math.sign(sdz) * 1.5;
          }
        }
      }

      posRef.current.x = newX;
      posRef.current.z = newZ;

      const targetHeading = Math.atan2(nx, nz);
      headingRef.current = lerpAngle(headingRef.current, targetHeading, 0.15);

      bobRef.current += delta * 8;

      stepTimerRef.current += delta;
      if (stepTimerRef.current >= STEP_INCREMENT_INTERVAL) {
        stepTimerRef.current = 0;
        setSteps((s) => {
          const next = s + 1;
          localStorage.setItem('vbc_fair_steps', String(next));
          return next;
        });
      }
    } else {
      bobRef.current *= 0.9;
    }

    let nearestStand: number | null = null;
    let nearestDist = Infinity;
    for (let i = 0; i < standPositions.length; i++) {
      const sp = standPositions[i];
      const dist = Math.sqrt(
        (posRef.current.x - sp.x) ** 2 + (posRef.current.z - sp.z) ** 2
      );
      if (dist < STAND_INTERACT_DISTANCE && dist < nearestDist) {
        nearestDist = dist;
        nearestStand = i;
      }
    }
    onNearStand(nearestStand);
  });

  return { posRef, headingRef, isMovingRef, bobRef, steps, setJoystick };
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
