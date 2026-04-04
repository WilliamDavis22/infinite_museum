import { MeshReflectorMaterial } from '@react-three/drei'

interface Props {
  width?: number
  depth?: number
  color?: string
}

export function ReflectiveFloor({ width = 24, depth = 40, color = '#0a0a0a' }: Props) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={false}>
      <planeGeometry args={[width, depth]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={12}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color={color}
        metalness={0.8}
        mirror={0}
      />
    </mesh>
  )
}
