import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mobiusVert, mobiusFrag } from '@/shaders/mobiusShader'

export function MobiusStrip() {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const U = 64
    const V = 24
    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const indices: number[] = []

    for (let j = 0; j <= V; j++) {
      for (let i = 0; i <= U; i++) {
        const u = (i / U) * Math.PI * 2
        const v = (j / V) * 2 - 1  // -1 to 1 (strip width)
        const width = 1.2

        // Möbius parameterization
        const x = (2 + (width / 2) * v * Math.cos(u / 2)) * Math.cos(u)
        const y = (2 + (width / 2) * v * Math.cos(u / 2)) * Math.sin(u)
        const z = (width / 2) * v * Math.sin(u / 2)
        positions.push(x, y, z)

        // Approximate normal via central differences
        const eps = 0.001
        const u2 = u + eps
        const nx = (2 + (width / 2) * v * Math.cos(u2 / 2)) * Math.cos(u2)
        const ny = (2 + (width / 2) * v * Math.cos(u2 / 2)) * Math.sin(u2)
        const nz = (width / 2) * v * Math.sin(u2 / 2)
        const v2 = v + eps
        const mx = (2 + (width / 2) * v2 * Math.cos(u / 2)) * Math.cos(u)
        const my = (2 + (width / 2) * v2 * Math.cos(u / 2)) * Math.sin(u)
        const mz = (width / 2) * v2 * Math.sin(u / 2)
        const du = new THREE.Vector3(nx - x, ny - y, nz - z)
        const dv = new THREE.Vector3(mx - x, my - y, mz - z)
        const normal = new THREE.Vector3().crossVectors(du, dv).normalize()
        normals.push(normal.x, normal.y, normal.z)

        uvs.push(i / U, j / V)
      }
    }

    for (let j = 0; j < V; j++) {
      for (let i = 0; i < U; i++) {
        const a = j * (U + 1) + i
        const b = a + 1
        const c = a + U + 1
        const d = c + 1
        indices.push(a, b, c, b, d, c)
      }
    }

    geo.setIndex(indices)
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    return geo
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.15
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <group ref={groupRef} scale={0.7}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={matRef}
          vertexShader={mobiusVert}
          fragmentShader={mobiusFrag}
          uniforms={{ uTime: { value: 0 } }}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
