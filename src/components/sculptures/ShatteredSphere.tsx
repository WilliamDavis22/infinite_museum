import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMuseumStore } from '@/store/useMuseumStore'

// Module-scope — no GC pressure
const _dummy = new THREE.Object3D()

const COUNT = 256

interface InstanceData {
  originalPos: THREE.Vector3
  explodeDir: THREE.Vector3
  explodeTarget: THREE.Vector3
  velX: number
  velY: number
  velZ: number
  velRX: number
  velRY: number
  velRZ: number
  currentPos: THREE.Vector3
  currentRot: THREE.Euler
  phase: number
  scale: number
}

type Phase = 'idle' | 'exploding' | 'reforming' | 'sigil'

function springStep(
  current: number,
  target: number,
  vel: { v: number },
  stiffness: number,
  damping: number,
  dt: number,
): number {
  const force = (target - current) * stiffness
  vel.v += force * dt
  vel.v *= Math.pow(damping, dt * 60)
  return current + vel.v * dt
}

// Build sigil formation — a star/pentagram silhouette from 256 planes
function buildSigilPositions(): THREE.Vector3[] {
  const positions: THREE.Vector3[] = []
  // Pack planes on a sphere surface, then flatten the sphere concept into a recognizable sigil
  // Strategy: fibonacci sphere positions, gives evenly distributed points
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const radius = 2.2
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = goldenAngle * i
    positions.push(new THREE.Vector3(
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius,
    ))
  }
  return positions
}

interface Props {
  color: string
}

export function ShatteredSphere({ color }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const phase = useRef<Phase>('idle')
  const phaseTime = useRef(0)
  const groupRef = useRef<THREE.Group>(null)
  const shatterTriggered = useMuseumStore((s) => s.shatterTriggered)
  const resetShatter = useMuseumStore((s) => s.resetShatter)

  const instanceData = useMemo<InstanceData[]>(() => {
    const sigilPositions = buildSigilPositions()
    return sigilPositions.map((orig) => {
      // Random outward explosion direction biased away from center
      const dir = orig.clone().normalize().multiplyScalar(1)
      dir.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
      )).normalize()

      return {
        originalPos: orig.clone(),
        explodeDir: dir,
        explodeTarget: dir.clone().multiplyScalar(8 + Math.random() * 8),
        velX: 0, velY: 0, velZ: 0,
        velRX: 0, velRY: 0, velRZ: 0,
        currentPos: orig.clone(),
        currentRot: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        ),
        phase: Math.random(),
        scale: 0.12 + Math.random() * 0.1,
      }
    })
  }, [])

  // Handle click — trigger shatter
  const handleClick = useCallback(() => {
    if (phase.current === 'idle' || phase.current === 'sigil') {
      phase.current = 'exploding'
      phaseTime.current = 0
    }
  }, [])

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return
    const dt = Math.min(delta, 0.04)

    // Check store trigger (from outside click)
    if (shatterTriggered && (phase.current === 'idle' || phase.current === 'sigil')) {
      phase.current = 'exploding'
      phaseTime.current = 0
      resetShatter()
    }

    phaseTime.current += dt

    // Rotate entire group slowly when sigil is formed
    if (groupRef.current) {
      if (phase.current === 'sigil' || phase.current === 'idle') {
        groupRef.current.rotation.y = clock.getElapsedTime() * 0.12
      }
    }

    for (let i = 0; i < COUNT; i++) {
      const d = instanceData[i]
      const delay = d.phase * 0.4  // staggered start

      if (phase.current === 'exploding') {
        const t = phaseTime.current - delay
        if (t > 0) {
          const velX = { v: d.velX }
          const velY = { v: d.velY }
          const velZ = { v: d.velZ }
          d.currentPos.x = springStep(d.currentPos.x, d.explodeTarget.x, velX, 30, 0.7, dt)
          d.currentPos.y = springStep(d.currentPos.y, d.explodeTarget.y, velY, 30, 0.7, dt)
          d.currentPos.z = springStep(d.currentPos.z, d.explodeTarget.z, velZ, 30, 0.7, dt)
          d.velX = velX.v; d.velY = velY.v; d.velZ = velZ.v

          // Tumble in flight
          const velRX = { v: d.velRX }
          d.currentRot.x = springStep(d.currentRot.x, d.currentRot.x + 0.3, velRX, 5, 0.9, dt)
          d.velRX = velRX.v
        }

        // After 1.5s, switch to reforming
        if (phaseTime.current > 1.5) {
          phase.current = 'reforming'
          phaseTime.current = 0
        }
      } else if (phase.current === 'reforming') {
        const velX = { v: d.velX }
        const velY = { v: d.velY }
        const velZ = { v: d.velZ }
        const velRX = { v: d.velRX }
        const velRY = { v: d.velRY }
        const velRZ = { v: d.velRZ }

        // Spring back to original position
        d.currentPos.x = springStep(d.currentPos.x, d.originalPos.x, velX, 80, 0.85, dt)
        d.currentPos.y = springStep(d.currentPos.y, d.originalPos.y, velY, 80, 0.85, dt)
        d.currentPos.z = springStep(d.currentPos.z, d.originalPos.z, velZ, 80, 0.85, dt)
        d.currentRot.x = springStep(d.currentRot.x, 0, velRX, 60, 0.85, dt)
        d.currentRot.y = springStep(d.currentRot.y, 0, velRY, 60, 0.85, dt)
        d.currentRot.z = springStep(d.currentRot.z, 0, velRZ, 60, 0.85, dt)
        d.velX = velX.v; d.velY = velY.v; d.velZ = velZ.v
        d.velRX = velRX.v; d.velRY = velRY.v; d.velRZ = velRZ.v

        if (phaseTime.current > 3.0) {
          phase.current = 'sigil'
          phaseTime.current = 0
        }
      } else {
        // idle / sigil — gentle position drift
        const t = clock.getElapsedTime()
        d.currentPos.x = d.originalPos.x + Math.sin(t * 0.3 + d.phase * 6) * 0.04
        d.currentPos.y = d.originalPos.y + Math.cos(t * 0.25 + d.phase * 5) * 0.04
        d.currentPos.z = d.originalPos.z + Math.sin(t * 0.2 + d.phase * 7) * 0.04
      }

      _dummy.position.copy(d.currentPos)
      _dummy.rotation.copy(d.currentRot)
      _dummy.scale.setScalar(d.scale)
      _dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, _dummy.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    // Recompute bounding sphere during explosion so it doesn't get culled
    if (phase.current === 'exploding') {
      meshRef.current.frustumCulled = false
    } else {
      meshRef.current.frustumCulled = true
    }
  })

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Invisible hit area for click detection */}
      <mesh visible={false}>
        <sphereGeometry args={[3, 8, 8]} />
        <meshBasicMaterial />
      </mesh>
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#050505"
          emissive={color}
          emissiveIntensity={1.2}
          metalness={0.8}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  )
}
