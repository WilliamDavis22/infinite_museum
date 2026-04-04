import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Reusable dummy — module scope
const _dummy = new THREE.Object3D()

interface Props {
  count: number
  bounds: [number, number, number]  // [x, y, z] spread
  color: string
  opacity?: number
}

export function ParticleDust({ count, bounds, color, opacity = 0.6 }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const { positions, phases, speeds } = useMemo(() => {
    const positions: THREE.Vector3[] = []
    const phases: number[] = []
    const speeds: number[] = []
    for (let i = 0; i < count; i++) {
      positions.push(new THREE.Vector3(
        (Math.random() - 0.5) * bounds[0],
        Math.random() * bounds[1],
        (Math.random() - 0.5) * bounds[2],
      ))
      phases.push(Math.random() * Math.PI * 2)
      speeds.push(0.2 + Math.random() * 0.4)
    }
    return { positions, phases, speeds }
  }, [count, bounds])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < count; i++) {
      const p = positions[i]
      _dummy.position.set(
        p.x + Math.sin(t * speeds[i] * 0.3 + phases[i]) * 0.3,
        p.y + Math.sin(t * speeds[i] + phases[i]) * 0.4,
        p.z + Math.cos(t * speeds[i] * 0.5 + phases[i] * 0.7) * 0.2,
      )
      _dummy.scale.setScalar(0.8 + Math.sin(t + phases[i]) * 0.2)
      _dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, _dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.018, 4, 4]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </instancedMesh>
  )
}
