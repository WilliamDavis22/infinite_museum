import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  position: [number, number, number]
  accentColor: string
  emissiveColor: string
}

const _dummy = new THREE.Object3D()

export function Corridor({ position, accentColor, emissiveColor }: Props) {
  const particlesRef = useRef<THREE.InstancedMesh>(null)

  const particleData = useMemo(() => {
    const count = 40
    const positions: [number, number, number][] = []
    const phases: number[] = []
    for (let i = 0; i < count; i++) {
      positions.push([
        (Math.random() - 0.5) * 6,
        Math.random() * 4,
        (Math.random() - 0.5) * 10,
      ])
      phases.push(Math.random() * Math.PI * 2)
    }
    return { count, positions, phases }
  }, [])

  useFrame(({ clock }) => {
    if (!particlesRef.current) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < particleData.count; i++) {
      const [x, y, z] = particleData.positions[i]
      const ph = particleData.phases[i]
      _dummy.position.set(
        x + Math.sin(t * 0.4 + ph) * 0.2,
        y + Math.sin(t * 0.6 + ph) * 0.3,
        z,
      )
      _dummy.scale.setScalar(0.6 + Math.sin(t + ph) * 0.15)
      _dummy.updateMatrix()
      particlesRef.current.setMatrixAt(i, _dummy.matrix)
    }
    particlesRef.current.instanceMatrix.needsUpdate = true
  })

  // Archway geometry: two pillars + arch torus
  const archRadius = 3.0
  const archTube = 0.12

  return (
    <group position={position}>
      {/* Left pillar */}
      <mesh position={[-archRadius * 0.85, 2.5, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 5, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.5} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[archRadius * 0.85, 2.5, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 5, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.5} />
      </mesh>
      {/* Arch torus (top half) */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[archRadius * 0.85, archTube, 8, 24, Math.PI]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={emissiveColor}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      {/* Subtle archway ambient light */}
      <pointLight
        position={[0, 4.5, 0]}
        color={emissiveColor}
        intensity={0.8}
        distance={12}
      />
      {/* Ambient particles drifting through */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, particleData.count]}>
        <sphereGeometry args={[0.015, 4, 4]} />
        <meshBasicMaterial color={emissiveColor} transparent opacity={0.5} depthWrite={false} />
      </instancedMesh>
    </group>
  )
}
