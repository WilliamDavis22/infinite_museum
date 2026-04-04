import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useMuseumStore } from '@/store/useMuseumStore'
import { CameraRig } from './CameraRig'
import { RoomRenderer } from './RoomRenderer'
import { PostProcessing } from './PostProcessing'

function SceneContent() {
  const roomIndex = useMuseumStore((s) => s.roomIndex)
  const roomSequence = useMuseumStore((s) => s.roomSequence)
  const ensureGenerated = useMuseumStore((s) => s.ensureGenerated)

  // Generate initial rooms on mount
  useEffect(() => {
    ensureGenerated(4)
  }, [ensureGenerated])

  // Generate rooms ahead as camera advances
  useEffect(() => {
    ensureGenerated(roomIndex + 3)
  }, [roomIndex, ensureGenerated])

  // Keep 3 rooms active: prev, current, next (+ one more for preload)
  const activeIndices = Array.from(
    new Set([Math.max(0, roomIndex - 1), roomIndex, roomIndex + 1, roomIndex + 2])
  )

  return (
    <>
      <CameraRig />
      {activeIndices.map((i) => {
        const room = roomSequence[i]
        if (!room) return null
        return (
          <Suspense key={room.id} fallback={null}>
            <RoomRenderer config={room} />
          </Suspense>
        )
      })}
      <PostProcessing />
    </>
  )
}

export function Scene() {
  return (
    <Canvas
      shadows={false}
      dpr={[1, 1.5]}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.85,
      }}
      camera={{ fov: 60, near: 0.1, far: 500, position: [0, 2, 0] }}
      style={{ width: '100%', height: '100%', background: '#000000' }}
    >
      <SceneContent />
    </Canvas>
  )
}
