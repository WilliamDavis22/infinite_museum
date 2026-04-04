import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  color: string
}

function buildHelixCurve(strand: 0 | 1, turns: number, height: number): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = []
  const steps = turns * 20
  const offset = strand === 0 ? 0 : Math.PI
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = t * turns * Math.PI * 2 + offset
    const radius = 0.9
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      t * height - height / 2,
      Math.sin(angle) * radius,
    ))
  }
  return new THREE.CatmullRomCurve3(points)
}

export function HelixColumn({ color }: Props) {
  const groupRef = useRef<THREE.Group>(null)

  const curves = useMemo(() => [
    buildHelixCurve(0, 4, 6),
    buildHelixCurve(1, 4, 6),
  ], [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2
    }
  })

  const c = new THREE.Color(color)

  return (
    <group ref={groupRef}>
      {curves.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 120, 0.055, 8, false]} />
          <meshStandardMaterial
            color="#000"
            emissive={c}
            emissiveIntensity={3}
            metalness={1}
            roughness={0.05}
          />
        </mesh>
      ))}
      {/* Node spheres along the helix */}
      {[0, 1].map((strand) => (
        Array.from({ length: 8 }, (_, j) => {
          const t = (j + 0.5) / 8
          const angle = t * 4 * Math.PI * 2 + (strand === 0 ? 0 : Math.PI)
          const r = 0.9
          return (
            <mesh key={`${strand}-${j}`} position={[Math.cos(angle) * r, t * 6 - 3, Math.sin(angle) * r]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#000" emissive={c} emissiveIntensity={4} />
            </mesh>
          )
        })
      ))}
    </group>
  )
}
