import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ObsidianConfig } from '@/generation/archetypes/obsidian'
import { ReflectiveFloor } from '@/components/shared/ReflectiveFloor'
import { FloatingFrame } from '@/components/shared/FloatingFrame'
import { ParticleDust } from '@/components/shared/ParticleDust'

interface Props {
  config: ObsidianConfig
  zOffset: number
}

// 3 frames per side, positioned symmetrically
const FRAME_LEFT_POSITIONS: [number, number, number][] = [
  [-11, 3.5, -8],
  [-11, 3.5, -18],
  [-11, 3.5, -28],
]
const FRAME_RIGHT_POSITIONS: [number, number, number][] = [
  [11, 3.5, -8],
  [11, 3.5, -18],
  [11, 3.5, -28],
]

export function ObsidianRoom({ config, zOffset }: Props) {
  const shaftRef1 = useRef<THREE.Mesh>(null)
  const shaftRef2 = useRef<THREE.Mesh>(null)
  const shaftRef3 = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.015 + Math.sin(t * 0.3) * 0.005
    if (shaftRef1.current) (shaftRef1.current.material as THREE.MeshBasicMaterial).opacity = pulse
    if (shaftRef2.current) (shaftRef2.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.7
    if (shaftRef3.current) (shaftRef3.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.5
  })

  const { palette, frameCount, frameShaders, dustDensity } = config
  const fogFar = config.fogDensity * 80

  const leftRotation: [number, number, number] = [0, Math.PI / 2, 0]
  const rightRotation: [number, number, number] = [0, -Math.PI / 2, 0]

  return (
    <group position={[0, 0, -zOffset]}>
      <fog attach="fog" args={[palette.fogColor, 5, fogFar]} />

      {/* Ambient and key lighting */}
      <ambientLight intensity={0.03} />
      <pointLight position={[0, 12, -20]} color="#fffae0" intensity={2} distance={30} />
      <pointLight position={[-8, 4, -15]} color={palette.emissive} intensity={0.5} distance={20} />
      <pointLight position={[8, 4, -15]} color={palette.emissive} intensity={0.5} distance={20} />

      {/* Reflective obsidian floor */}
      <ReflectiveFloor width={24} depth={40} color="#0a0a0a" />

      {/* Ceiling */}
      <mesh position={[0, 8, -20]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 40]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>

      {/* Walls */}
      <mesh position={[-12, 4, -20]}>
        <boxGeometry args={[0.3, 8, 40]} />
        <meshStandardMaterial color="#080808" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[12, 4, -20]}>
        <boxGeometry args={[0.3, 8, 40]} />
        <meshStandardMaterial color="#080808" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 4, -40]}>
        <boxGeometry args={[24, 8, 0.3]} />
        <meshStandardMaterial color="#080808" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Light shaft — 3 stacked transparent planes */}
      <mesh ref={shaftRef1} position={[0, 8, -10]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.8, 20]} />
        <meshBasicMaterial color="#fffae0" transparent opacity={0.018} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={shaftRef2} position={[0.3, 8, -10]} rotation={[0, 0.15, 0]}>
        <planeGeometry args={[1.4, 20]} />
        <meshBasicMaterial color="#fffae0" transparent opacity={0.012} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={shaftRef3} position={[-0.2, 8, -10]} rotation={[0, -0.1, 0]}>
        <planeGeometry args={[1.2, 20]} />
        <meshBasicMaterial color="#fffae0" transparent opacity={0.008} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Gilded frames — left wall */}
      {FRAME_LEFT_POSITIONS.slice(0, Math.ceil(frameCount / 2)).map((pos, i) => (
        <FloatingFrame
          key={`left-${i}`}
          position={pos}
          rotation={leftRotation}
          shaderIndex={frameShaders[i] ?? i}
          accentColor={palette.accent}
        />
      ))}
      {/* Gilded frames — right wall */}
      {FRAME_RIGHT_POSITIONS.slice(0, Math.floor(frameCount / 2)).map((pos, i) => (
        <FloatingFrame
          key={`right-${i}`}
          position={pos}
          rotation={rightRotation}
          shaderIndex={frameShaders[Math.ceil(frameCount / 2) + i] ?? i + 3}
          accentColor={palette.accent}
        />
      ))}

      {/* Ambient dust particles */}
      <ParticleDust
        count={dustDensity}
        bounds={[22, 7, 38]}
        color={palette.emissive}
        opacity={0.4}
      />

      {/* Subtle floor mist */}
      <ParticleDust
        count={80}
        bounds={[20, 0.5, 36]}
        color={palette.fogColor}
        opacity={0.15}
      />
    </group>
  )
}
