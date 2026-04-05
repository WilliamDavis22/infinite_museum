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
import { DriftLight, DriftingGeometryCloud } from '@/components/shared/RoomAccents'

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
        <icosahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color="#050508" emissive={color} emissiveIntensity={1.25} flatShading />
      </mesh>
      <pointLight color={color} intensity={0.85} distance={14} decay={2} />
    </group>
  )
}

function SlowTorusHalo({ emissive, accent }: { emissive: string; accent: string }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.055
  })
  return (
    <group ref={ref} position={[0, 7.35, -20]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[11.6, 0.05, 6, 56]} />
        <meshStandardMaterial
          color="#000000"
          emissive={emissive}
          emissiveIntensity={0.42}
          transparent
          opacity={0.88}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 5]}>
        <torusGeometry args={[11.25, 0.022, 6, 56]} />
        <meshStandardMaterial
          color="#000000"
          emissive={accent}
          emissiveIntensity={0.32}
          transparent
          opacity={0.82}
          depthWrite={false}
        />
      </mesh>
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

      <ambientLight intensity={0.055} />

      <SlowTorusHalo emissive={palette.emissive} accent={palette.accent} />

      <DriftingGeometryCloud
        count={56}
        bounds={[30, 9, 30]}
        color={palette.primary}
        zCenter={-20}
        emissiveIntensity={0.26}
        sizeMin={0.1}
        sizeMax={0.42}
      />
      <DriftingGeometryCloud
        count={40}
        bounds={[28, 7, 28]}
        color={palette.accent}
        zCenter={-20}
        emissiveIntensity={0.2}
        sizeMin={0.08}
        sizeMax={0.28}
      />

      {Array.from({ length: 2 }, (_, i) => (
        <DriftLight
          key={`ceiling-${i}`}
          index={i}
          total={2}
          color={orbitColors[(i + 2) % orbitColors.length]}
          zCenter={-20}
          radius={9.5}
          height={6.5}
          speed={0.07 + i * 0.025}
        />
      ))}

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
        <ParticleDust
          count={Math.min(220, config.particleDensity + 60)}
          bounds={[28, 9, 28]}
          color={palette.accent}
          opacity={0.2}
        />
      </group>

      {/* Central floor glow */}
      <pointLight position={[0, 0.5, -20]} color={palette.emissive} intensity={0.75} distance={18} />
      <pointLight position={[-6, 1.2, -24]} color={palette.accent} intensity={0.4} distance={14} />
      <pointLight position={[6, 1.2, -16]} color={palette.primary} intensity={0.35} distance={14} />
    </group>
  )
}
