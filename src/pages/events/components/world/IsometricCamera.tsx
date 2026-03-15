import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { LERP_CAMERA } from '../../constants';

interface IsometricCameraProps {
  targetRef: React.RefObject<THREE.Vector3>;
}

export function IsometricCamera({ targetRef }: IsometricCameraProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const initialized = useRef(false);

  // Set initial camera position once
  useEffect(() => {
    if (!initialized.current && targetRef.current) {
      const offset = new THREE.Vector3(8, 10, 8);
      camera.position.copy(targetRef.current).add(offset);
      camera.lookAt(targetRef.current);
      initialized.current = true;
    }
  }, [camera, targetRef]);

  // Smoothly move the orbit target to follow the player
  useFrame(() => {
    if (!controlsRef.current || !targetRef.current) return;
    const controls = controlsRef.current;
    const target = controls.target as THREE.Vector3;
    target.lerp(targetRef.current, LERP_CAMERA);
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={40}
      maxPolarAngle={Math.PI / 2.2}
      minPolarAngle={0.2}
      zoomSpeed={0.8}
      panSpeed={0.6}
      rotateSpeed={0.5}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}
