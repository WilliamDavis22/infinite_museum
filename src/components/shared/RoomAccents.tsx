import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const _dummy = new THREE.Object3D()
const _euler = new THREE.Euler()

/** Slow-drifting polyhedra — reads as floating terrain / debris, not nightclub beams */
export function DriftingGeometryCloud({
  count,
  bounds,
  color,
  zCenter = -20,
  emissiveIntensity = 0.32,
  sizeMin = 0.12,
  sizeMax = 0.55,
}: {
  count: number
  bounds: [number, number, number]
  color: string
  zCenter?: number
  emissiveIntensity?: number
  sizeMin?: number
  sizeMax?: number
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const bx = bounds[0]
  const by = bounds[1]
  const bz = bounds[2]
  const data = useMemo(() => {
    const out: {
      bx: number
      by: number
      bz: number
      ph: number
      sx: number
      sy: number
      sz: number
      scale: number
      ry: number
    }[] = []
    for (let i = 0; i < count; i++) {
      out.push({
        bx: (Math.random() - 0.5) * bx,
        by: Math.random() * by,
        bz: zCenter + (Math.random() - 0.5) * bz,
        ph: Math.random() * Math.PI * 2,
        sx: 0.08 + Math.random() * 0.11,
        sy: 0.06 + Math.random() * 0.09,
        sz: 0.07 + Math.random() * 0.1,
        scale: sizeMin + Math.random() * (sizeMax - sizeMin),
        ry: (Math.random() - 0.5) * 0.35,
      })
    }
    return out
  }, [count, bx, by, bz, zCenter, sizeMin, sizeMax])

  const ryAcc = useRef<number[]>([])
  if (ryAcc.current.length !== count) {
    ryAcc.current = Array.from({ length: count }, () => Math.random() * Math.PI * 2)
  }

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const dt = Math.min(delta, 0.05)
    for (let i = 0; i < count; i++) {
      const d = data[i]
      ryAcc.current[i] += d.ry * dt
      _dummy.position.set(
        d.bx + Math.sin(t * d.sx + d.ph) * 0.9,
        d.by + Math.sin(t * d.sy + d.ph * 1.3) * 0.55,
        d.bz + Math.cos(t * d.sz + d.ph * 0.7) * 0.75,
      )
      _euler.set(
        Math.sin(t * 0.11 + d.ph) * 0.35,
        ryAcc.current[i],
        Math.cos(t * 0.09 + d.ph * 0.5) * 0.28,
      )
      _dummy.rotation.copy(_euler)
      _dummy.scale.setScalar(d.scale)
      _dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, _dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#0a0a0c"
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        metalness={0.75}
        roughness={0.35}
        flatShading
      />
    </instancedMesh>
  )
}

/** Large dark silhouettes — distant “land” in the haze */
export function DistantSilhouettes({ color, emissive }: { color: string; emissive: string }) {
  const configs = useMemo(
    () =>
      [
        { x: -14, y: 1.1, z: -9, w: 5, h: 2.2, d: 3, rot: 0.15 },
        { x: 12, y: 1.5, z: -13, w: 6, h: 3, d: 2.5, rot: -0.2 },
        { x: -8, y: 0.9, z: -33, w: 7, h: 1.8, d: 4, rot: 0.08 },
        { x: 10, y: 1.25, z: -29, w: 5.5, h: 2.5, d: 3.5, rot: -0.12 },
        { x: 0, y: 0.65, z: -37, w: 9, h: 1.4, d: 5, rot: 0 },
      ] as const,
    [],
  )

  return (
    <group>
      {configs.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation={[0, c.rot, 0]}>
          <boxGeometry args={[c.w, c.h, c.d]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={0.08}
            metalness={0.4}
            roughness={0.85}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Soft vertical light columns (additive planes) — toned for gallery, not strobes */
export function VerticalLightColumns({
  color,
  positions,
  z = -20,
}: {
  color: string
  positions: [number, number][]
  z?: number
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.28 + Math.sin(t * 0.35) * 0.08
    refs.current.forEach((m) => {
      if (!m) return
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = pulse * 0.55
    })
  })
  return (
    <group>
      {positions.map(([x, h], i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[x, h / 2 + 1, z]}
        >
          <planeGeometry args={[0.12, h]} />
          <meshBasicMaterial color={color} transparent opacity={0.28} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

/** Distant twinkling points — void / deep space */
export function TwinkleField({
  count,
  bounds,
  color,
  zCenter = -20,
}: {
  count: number
  bounds: [number, number, number]
  color: string
  zCenter?: number
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { base, phases } = useMemo(() => {
    const b: THREE.Vector3[] = []
    const ph: number[] = []
    for (let i = 0; i < count; i++) {
      b.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * bounds[0],
          4 + Math.random() * bounds[1],
          zCenter + (Math.random() - 0.5) * bounds[2],
        ),
      )
      ph.push(Math.random() * Math.PI * 2)
    }
    return { base: b, phases: ph }
  }, [count, bounds, zCenter])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < count; i++) {
      const p = base[i]
      const tw = 0.6 + Math.sin(t * 1.2 + phases[i]) * 0.35
      _dummy.position.copy(p)
      _dummy.scale.setScalar(0.04 * tw)
      _dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, _dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} depthWrite={false} />
    </instancedMesh>
  )
}

/** Soft drifting light — lower key than “mirror ball” */
export function DriftLight({
  index,
  total,
  color,
  zCenter,
  radius,
  height,
  speed,
}: {
  index: number
  total: number
  color: string
  zCenter: number
  radius: number
  height: number
  speed: number
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const angle = t * speed + (index / total) * Math.PI * 2
    ref.current.position.set(
      Math.cos(angle) * radius,
      height + Math.sin(t * 0.35 + index) * 0.6,
      zCenter + Math.sin(angle * 0.65) * (radius * 0.55),
    )
  })
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial color="#050508" emissive={color} emissiveIntensity={0.85} flatShading />
      </mesh>
      <pointLight color={color} intensity={0.42} distance={16} decay={2} />
    </group>
  )
}
