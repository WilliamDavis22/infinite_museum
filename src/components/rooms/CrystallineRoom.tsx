import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { CrystallineConfig } from '@/generation/archetypes/crystalline'

interface Props {
  config: CrystallineConfig
  zOffset: number
}

// Light colors for prismatic effect
const PRISM_COLORS = ['#ff3366', '#3366ff', '#33ff99', '#ffcc00', '#cc33ff', '#00ffcc']

export function CrystallineRoom({ config, zOffset }: Props) {
  const lightRefs = Array.from({ length: config.lightCount }, () => useRef<THREE.PointLight>(null))

  const crystalData = useMemo(() => {
    const seededRng = (seed: number) => {
      let s = seed
      return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
    }
    const rng = seededRng(config.crystalCount * 7 + 13)
    return Array.from({ length: config.crystalCount }, (_, i) => {
      const angle = (i / config.crystalCount) * Math.PI * 2 + rng() * 0.8
      const radius = 3 + rng() * 8
      const x = Math.cos(angle) * radius
      const z = -20 + Math.sin(angle) * radius
      const fromFloor = rng() > 0.4
      const height = config.crystalHeight * (0.3 + rng() * 0.7)
      const tilt = (rng() - 0.5) * 0.4
      return { x, z, fromFloor, height, tilt, scale: 0.15 + rng() * 0.25 }
    })
  }, [config.crystalCount, config.crystalHeight])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    lightRefs.forEach((ref, i) => {
      if (!ref.current) return
      const angle = t * 0.25 + (i / config.lightCount) * Math.PI * 2
      ref.current.position.set(
        Math.cos(angle) * 6,
        3 + Math.sin(t * 0.3 + i) * 1.5,
        -20 + Math.sin(angle) * 6,
      )
    })
  })

  const { palette } = config
  const fogFar = config.fogDensity * 70

  return (
    <group position={[0, 0, -zOffset]}>
      <fog attach="fog" args={[palette.fogColor, 5, fogFar]} />

      <ambientLight intensity={0.02} />

      {/* Prismatic orbiting lights */}
      {Array.from({ length: config.lightCount }, (_, i) => (
        <pointLight
          key={i}
          ref={lightRefs[i]}
          color={PRISM_COLORS[i % PRISM_COLORS.length]}
          intensity={3}
          distance={20}
        />
      ))}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color="#030305" metalness={0.6} roughness={0.7} />
      </mesh>

      {/* Crystal clusters */}
      {crystalData.map((c, i) => (
        <group
          key={i}
          position={[c.x, c.fromFloor ? 0 : 8, c.z]}
          rotation={[c.fromFloor ? 0 : Math.PI, c.tilt, c.tilt * 0.7]}
        >
          {/* Main crystal spike */}
          <mesh position={[0, c.height / 2, 0]}>
            <coneGeometry args={[c.scale, c.height, 5, 1]} />
            <meshStandardMaterial
              color={palette.primary}
              emissive={palette.accent}
              emissiveIntensity={0.6}
              metalness={0.95}
              roughness={0.1}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Secondary smaller crystal */}
          <mesh position={[c.scale * 0.8, c.height * 0.4, c.scale * 0.5]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[c.scale * 0.6, c.height * 0.6, 5, 1]} />
            <meshStandardMaterial
              color={palette.accent}
              emissive={palette.emissive}
              emissiveIntensity={0.4}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.75}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
