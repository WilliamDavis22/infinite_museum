import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import type { LabyrinthConfig } from '@/generation/archetypes/labyrinth'
import { ParticleDust } from '@/components/shared/ParticleDust'
import { DriftingGeometryCloud } from '@/components/shared/RoomAccents'

interface Props {
  config: LabyrinthConfig
  zOffset: number
}

const CORRIDOR_WIDTH = 8
const CORRIDOR_HEIGHT = 7
const CORRIDOR_LENGTH = 40

export function LabyrinthRoom({ config, zOffset }: Props) {
  const { palette } = config
  const fogFar = config.fogDensity * 60
  const stripsGroupRef = useRef<THREE.Group>(null)

  const stripData = useMemo(() => {
    const positions: [number, number][] = [
      [-CORRIDOR_WIDTH / 2 + 0.15, 0.1],
      [CORRIDOR_WIDTH / 2 - 0.15, 0.1],
      [-CORRIDOR_WIDTH / 2 + 0.15, CORRIDOR_HEIGHT - 0.1],
      [CORRIDOR_WIDTH / 2 - 0.15, CORRIDOR_HEIGHT - 0.1],
      [-CORRIDOR_WIDTH / 2 + 0.1, CORRIDOR_HEIGHT / 2],
      [CORRIDOR_WIDTH / 2 - 0.1, CORRIDOR_HEIGHT / 2],
    ]
    return positions.slice(0, Math.min(config.stripCount, positions.length)).map(([x, y]) => {
      const curve = new THREE.LineCurve3(
        new THREE.Vector3(x, y, -zOffset + 1),
        new THREE.Vector3(x, y, -zOffset - CORRIDOR_LENGTH + 1),
      )
      return { curve, x, y }
    })
  }, [config.stripCount, zOffset])

  useFrame(({ clock }) => {
    const g = stripsGroupRef.current
    if (!g) return
    const pulse = 0.92 + Math.sin(clock.getElapsedTime() * 1.4) * 0.07
    const target = config.stripIntensity * pulse
    g.children.forEach((ch) => {
      const mesh = ch as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined
      if (mat?.emissiveIntensity !== undefined) mat.emissiveIntensity = target
    })
  })

  return (
    <group position={[0, 0, -zOffset]}>
      <fog attach="fog" args={[palette.fogColor, 3, fogFar]} />

      <ambientLight intensity={0.038} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}>
        <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_LENGTH]} />
        <meshStandardMaterial color="#060606" metalness={0.3} roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CORRIDOR_HEIGHT, -20]}>
        <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_LENGTH]} />
        <meshStandardMaterial color="#040404" roughness={1} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, CORRIDOR_HEIGHT / 2, -40]}>
        <planeGeometry args={[CORRIDOR_WIDTH, CORRIDOR_HEIGHT]} />
        <meshStandardMaterial color="#040404" roughness={1} />
      </mesh>

      {/* Left wall — MeshReflectorMaterial for true reflections */}
      <mesh position={[-CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT / 2, -20]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[CORRIDOR_LENGTH, CORRIDOR_HEIGHT]} />
        <MeshReflectorMaterial
          blur={[200, 100]}
          resolution={512}
          mixBlur={8}
          mixStrength={30}
          roughness={0.0}
          depthScale={1.0}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#030308"
          metalness={0.95}
          mirror={0}
        />
      </mesh>

      {/* Right wall — fake metalness mirror (no recursive reflection artifact) */}
      <mesh position={[CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT / 2, -20]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[CORRIDOR_LENGTH, CORRIDOR_HEIGHT]} />
        <meshStandardMaterial color="#030308" metalness={0.98} roughness={0.0} />
      </mesh>

      {/* Neon strip lights */}
      <group ref={stripsGroupRef}>
        {stripData.map((strip, i) => (
          <mesh key={i}>
            <tubeGeometry args={[strip.curve, 60, 0.04, 6, false]} />
            <meshStandardMaterial
              color="#000"
              emissive={palette.emissive}
              emissiveIntensity={config.stripIntensity}
              metalness={1}
              roughness={0}
            />
          </mesh>
        ))}
      </group>

      <DriftingGeometryCloud
        count={44}
        bounds={[6.5, CORRIDOR_HEIGHT * 0.92, 34]}
        color={palette.emissive}
        zCenter={-20}
        emissiveIntensity={0.3}
        sizeMin={0.07}
        sizeMax={0.28}
      />
      <DriftingGeometryCloud
        count={28}
        bounds={[5.5, 5, 32]}
        color={palette.accent}
        zCenter={-20}
        emissiveIntensity={0.2}
        sizeMin={0.06}
        sizeMax={0.2}
      />

      <ParticleDust count={100} bounds={[7, 5, 36]} color={palette.accent} opacity={0.28} />

      {/* Point lights near strips */}
      <pointLight position={[-CORRIDOR_WIDTH / 2 + 1, 0.5, -10]} color={palette.emissive} intensity={1.75} distance={16} />
      <pointLight position={[CORRIDOR_WIDTH / 2 - 1, 0.5, -10]} color={palette.accent} intensity={1.75} distance={16} />
      <pointLight position={[-CORRIDOR_WIDTH / 2 + 1, 0.5, -30]} color={palette.emissive} intensity={1.45} distance={16} />
      <pointLight position={[CORRIDOR_WIDTH / 2 - 1, 0.5, -30]} color={palette.accent} intensity={1.45} distance={16} />
      <pointLight position={[0, CORRIDOR_HEIGHT - 0.3, -20]} color={palette.emissive} intensity={0.65} distance={14} />
    </group>
  )
}
