import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SheepModel } from '../sheep/SheepModel';
import { LERP_REMOTE, REMOTE_PLAYER_HIDE_DISTANCE } from '../../constants';
import type { RemotePlayer } from '../../types';

interface RemotePlayersProps {
  players: Map<string, RemotePlayer>;
  localPos: React.RefObject<THREE.Vector3>;
}

function RemotePlayerEntity({ player, localPos }: { player: RemotePlayer; localPos: React.RefObject<THREE.Vector3> }) {
  const groupRef = useRef<THREE.Group>(null);
  const interpRef = useRef({ x: player.pos_x, z: player.pos_z, heading: player.heading });

  useFrame(() => {
    const tx = player.targetX ?? player.pos_x;
    const tz = player.targetZ ?? player.pos_z;
    const th = player.targetHeading ?? player.heading;

    interpRef.current.x += (tx - interpRef.current.x) * LERP_REMOTE;
    interpRef.current.z += (tz - interpRef.current.z) * LERP_REMOTE;

    let dh = th - interpRef.current.heading;
    while (dh > Math.PI) dh -= Math.PI * 2;
    while (dh < -Math.PI) dh += Math.PI * 2;
    interpRef.current.heading += dh * LERP_REMOTE;

    if (groupRef.current) {
      groupRef.current.position.x = interpRef.current.x;
      groupRef.current.position.z = interpRef.current.z;
      groupRef.current.rotation.y = interpRef.current.heading;

      if (localPos.current) {
        const dx = interpRef.current.x - localPos.current.x;
        const dz = interpRef.current.z - localPos.current.z;
        groupRef.current.visible = Math.sqrt(dx * dx + dz * dz) < REMOTE_PLAYER_HIDE_DISTANCE;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <SheepModel
        avatar={player.avatar}
        name={player.name}
        position={[0, 0, 0]}
        rotation={0}
        showName
        scale={0.8}
      />
    </group>
  );
}

export function RemotePlayers({ players, localPos }: RemotePlayersProps) {
  return (
    <>
      {Array.from(players.values()).map((p) => (
        <RemotePlayerEntity key={p.device_id} player={p} localPos={localPos} />
      ))}
    </>
  );
}
