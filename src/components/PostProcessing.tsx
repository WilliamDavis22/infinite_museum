import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, DepthOfField } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { useMuseumStore } from '@/store/useMuseumStore'

export function PostProcessing() {
  const chromaticOffsetRef = useRef(new THREE.Vector2(0.001, 0.001))
  const roomIndex = useMuseumStore((s) => s.roomIndex)
  const roomSequence = useMuseumStore((s) => s.roomSequence)

  const currentRoom = roomSequence[roomIndex]
  const bloomIntensity = currentRoom?.variant.palette.bloomIntensity ?? 1.5

  useFrame(() => {
    // Chromatic aberration: intensify in RESONANCE rooms, near-zero in VOID
    const target = currentRoom?.archetype === 'resonance'
      ? 0.004
      : currentRoom?.archetype === 'void'
      ? 0.0005
      : 0.0015

    const current = chromaticOffsetRef.current.x
    chromaticOffsetRef.current.x += (target - current) * 0.05
    chromaticOffsetRef.current.y += (target - chromaticOffsetRef.current.y) * 0.05
  })

  return (
    <EffectComposer multisampling={0}>
      <DepthOfField
        focusDistance={0.015}
        focalLength={0.025}
        bokehScale={2}
        height={480}
      />
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.025}
        mipmapBlur
      />
      <ChromaticAberration
        offset={chromaticOffsetRef.current}
        radialModulation={true}
        modulationOffset={0.5}
      />
      <Vignette
        offset={0.35}
        darkness={0.75}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
