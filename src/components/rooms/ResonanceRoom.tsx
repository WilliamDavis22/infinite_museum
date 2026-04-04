import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ResonanceConfig } from '@/generation/archetypes/resonance'
import { Icosahedron } from '@/components/sculptures/Icosahedron'
import { NestedTori } from '@/components/sculptures/NestedTori'
import { ShatteredSphere } from '@/components/sculptures/ShatteredSphere'
import { HelixColumn } from '@/components/sculptures/HelixColumn'
import { MobiusStrip } from '@/components/sculptures/MobiusStrip'
import { ParticleDust } from '@/components/shared/ParticleDust'

interface Props {
  config: ResonanceConfig
  zOffset: number
}

// Orbiting group component — avoids hooks-in-loop issue
interface OrbitProps {
  index: number
  total: number
  radius: number
  speed: number
  color: string
}

function OrbitLight({ index, total, radius, speed, color }: OrbitProps) {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const angle = t * speed + (index / total) * Math.PI * 2
    const wobble = Math.sin(t * 0.3 + index) * 0.5
    ref.current.position.set(
      Math.cos(angle) * radius,
      wobble,
      Math.sin(angle) * radius,
    )
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={4} />
      </mesh>
      <pointLight color={color} intensity={1.5} distance={12} />
    </group>
  )
}

export function ResonanceRoom({ config, zOffset }: Props) {
  const { palette } = config
  const fogFar = config.fogDensity * 80
  const orbitColors = [
    palette.emissive,
    palette.accent,
    palette.primary,
    palette.emissive,
    palette.accent,
  ]

  function renderSculpture() {
    switch (config.sculptureType) {
      case 'icosahedron':
        return <Icosahedron color1={palette.primary} color2={palette.accent} />
      case 'nestedTori':
        return <NestedTori color={palette.emissive} />
      case 'shatteredSphere':
        return <ShatteredSphere color={palette.emissive} />
      case 'helixColumn':
        return <HelixColumn color={palette.emissive} />
      case 'mobiusStrip':
        return <MobiusStrip />
    }
  }

  return (
    <group position={[0, 0, -zOffset]}>
      <fog attach="fog" args={[palette.fogColor, 5, fogFar]} />

      <ambientLight intensity={0.04} />

      {/* Central sculpture platform */}
      <group position={[0, 2.2, -20]}>
        {renderSculpture()}

        {/* Orbiting emissive spheres with point lights */}
        {Array.from({ length: config.orbitCount }, (_, i) => (
          <OrbitLight
            key={i}
            index={i}
            total={config.orbitCount}
            radius={config.orbitRadius}
            speed={config.orbitSpeed}
            color={orbitColors[i]}
          />
        ))}
      </group>

      {/* Circular floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}>
        <circleGeometry args={[14, 48]} />
        <meshStandardMaterial color="#060606" metalness={0.7} roughness={0.8} />
      </mesh>

      {/* Cylindrical walls */}
      <mesh position={[0, 4, -20]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[14, 14, 8, 32, 1, true]} />
        <meshStandardMaterial color="#050505" side={THREE.BackSide} roughness={1} />
      </mesh>

      {/* Ceiling dome */}
      <mesh position={[0, 8, -20]}>
        <sphereGeometry args={[14, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#040404" side={THREE.BackSide} roughness={1} />
      </mesh>

      {/* Particle field */}
      <group position={[0, 0, -20]}>
        <ParticleDust
          count={config.particleDensity}
          bounds={[26, 8, 26]}
          color={palette.emissive}
          opacity={0.35}
        />
      </group>

      {/* Central floor glow */}
      <pointLight position={[0, 0.5, -20]} color={palette.emissive} intensity={0.5} distance={15} />
    </group>
  )
}
