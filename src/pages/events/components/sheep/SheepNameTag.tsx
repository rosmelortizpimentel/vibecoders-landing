import { Billboard, Text } from '@react-three/drei';

interface SheepNameTagProps {
  name: string;
}

export function SheepNameTag({ name }: SheepNameTagProps) {
  return (
    <Billboard position={[0, 1.6, 0]} follow lockX={false} lockY={false} lockZ={false}>
      {/* Background */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[name.length * 0.08 + 0.2, 0.2]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>
      <Text
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {name}
      </Text>
    </Billboard>
  );
}
