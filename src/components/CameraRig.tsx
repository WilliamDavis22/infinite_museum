import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMuseumStore, roomCenterZ } from '@/store/useMuseumStore'
import { ROOM_STRIDE } from '@/generation/roomGenerator'
import { clamp } from '@/generation/rng'

// Module-scope working objects — no GC pressure
const _targetPos = new THREE.Vector3()
const _lookTarget = new THREE.Vector3()
const _camQuat = new THREE.Quaternion()
const _targetQuat = new THREE.Quaternion()
const _pitchQuat = new THREE.Quaternion()
const _pitchAxis = new THREE.Vector3(1, 0, 0)
const _up = new THREE.Vector3(0, 1, 0)
const _m = new THREE.Matrix4()

// How long (seconds) after user input before auto-tour resumes
const RESUME_DELAY = 4.0

/** Max look-left / look-right (radians) — ~52° total each way */
const YAW_LIMIT = 0.9
const YAW_SENSITIVITY = 0.0022

/** Max look up / down (radians) — ~±28° */
const PITCH_LIMIT = 0.48
const PITCH_SENSITIVITY = 0.0022

export function CameraRig() {
  const { camera, gl } = useThree()
  const velocityRef = useRef(0)
  const cameraZRef = useRef(0)
  const keysHeld = useRef({ up: false, down: false })
  const lastUserInputRef = useRef(-Infinity)  // elapsed time of last user interaction
  const yawRef = useRef(0)
  const pitchRef = useRef(0)
  const dragLookRef = useRef(false)
  const activePointerIdRef = useRef<number | null>(null)
  const lastPointerXRef = useRef(0)
  const lastPointerYRef = useRef(0)

  const setCameraZ = useMuseumStore((s) => s.setCameraZ)
  const ensureGenerated = useMuseumStore((s) => s.ensureGenerated)
  const autoTour = useMuseumStore((s) => s.autoTour)
  const autoTourSpeed = useMuseumStore((s) => s.autoTourSpeed)

  useEffect(() => {
    function markInput() {
      // Record the elapsed time via a ref updated each frame (see below)
      lastUserInputRef.current = performance.now() / 1000
    }

    function onWheel(e: WheelEvent) {
      velocityRef.current -= e.deltaY * 0.012
      markInput()
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'w' || e.key === 'W') {
        keysHeld.current.up = true
        markInput()
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 's' || e.key === 'S') {
        keysHeld.current.down = true
        markInput()
      }
      // Arrow key snap: Up/W = forward into museum, Down/S = backward
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        const currentRoom = Math.round(cameraZRef.current / ROOM_STRIDE)
        const targetRoom = currentRoom + 1
        const targetZ = roomCenterZ(targetRoom)
        cameraZRef.current = targetZ
        velocityRef.current = 0
        setCameraZ(targetZ)
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        const currentRoom = Math.round(cameraZRef.current / ROOM_STRIDE)
        const targetRoom = Math.max(0, currentRoom - 1)
        const targetZ = roomCenterZ(targetRoom)
        cameraZRef.current = targetZ
        velocityRef.current = 0
        setCameraZ(targetZ)
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'w' || e.key === 'W') {
        keysHeld.current.up = false
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 's' || e.key === 'S') {
        keysHeld.current.down = false
      }
    }

    const el = gl.domElement

    /**
     * Pointer Events + setPointerCapture: iOS Safari often does not deliver touchmove to window
     * or treats one-finger drag as scroll unless touch-action:none and capture keep events on canvas.
     */
    function onLookPointerDown(e: PointerEvent) {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (activePointerIdRef.current !== null) return
      activePointerIdRef.current = e.pointerId
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      dragLookRef.current = true
      lastPointerXRef.current = e.clientX
      lastPointerYRef.current = e.clientY
      markInput()
    }

    function onLookPointerMove(e: PointerEvent) {
      if (!dragLookRef.current || e.pointerId !== activePointerIdRef.current) return
      const dx = e.clientX - lastPointerXRef.current
      const dy = e.clientY - lastPointerYRef.current
      lastPointerXRef.current = e.clientX
      lastPointerYRef.current = e.clientY
      yawRef.current = clamp(yawRef.current - dx * YAW_SENSITIVITY, -YAW_LIMIT, YAW_LIMIT)
      pitchRef.current = clamp(pitchRef.current - dy * PITCH_SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT)
      markInput()
    }

    function endLookPointer(e: PointerEvent) {
      if (e.pointerId !== activePointerIdRef.current) return
      activePointerIdRef.current = null
      dragLookRef.current = false
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }

    function onLostPointerCapture(e: PointerEvent) {
      if (activePointerIdRef.current !== e.pointerId) return
      activePointerIdRef.current = null
      dragLookRef.current = false
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    el.addEventListener('pointerdown', onLookPointerDown)
    el.addEventListener('pointermove', onLookPointerMove)
    el.addEventListener('pointerup', endLookPointer)
    el.addEventListener('pointercancel', endLookPointer)
    el.addEventListener('lostpointercapture', onLostPointerCapture)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      el.removeEventListener('pointerdown', onLookPointerDown)
      el.removeEventListener('pointermove', onLookPointerMove)
      el.removeEventListener('pointerup', endLookPointer)
      el.removeEventListener('pointercancel', endLookPointer)
      el.removeEventListener('lostpointercapture', onLostPointerCapture)
    }
  }, [setCameraZ, gl])

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05)
    const elapsed = clock.getElapsedTime()

    // W/S hold continuous movement — W/ArrowUp = forward into museum
    if (keysHeld.current.up) velocityRef.current += 6.0 * dt
    if (keysHeld.current.down) velocityRef.current -= 6.0 * dt

    // Auto-tour: inject slow forward velocity when enabled and user is idle
    if (autoTour) {
      const idleSeconds = elapsed - lastUserInputRef.current
      if (idleSeconds > RESUME_DELAY) {
        // Smoothly blend in auto velocity — ramp up over ~1s after resume
        const blend = clamp((idleSeconds - RESUME_DELAY) / 1.0, 0, 1)
        velocityRef.current += autoTourSpeed * blend * dt
        // Gently recenter yaw / pitch while auto-touring so the path stays readable
        const recenter = clamp(dt * 1.35, 0, 1)
        yawRef.current += (0 - yawRef.current) * recenter
        pitchRef.current += (0 - pitchRef.current) * recenter
      }
    }

    // Apply velocity
    cameraZRef.current += velocityRef.current * dt * 60
    cameraZRef.current = Math.max(0, cameraZRef.current)

    // Velocity decay (momentum)
    velocityRef.current *= Math.pow(0.88, dt * 60)

    // Soft magnetic snap toward nearest room center when nearly still
    if (Math.abs(velocityRef.current) < 0.4) {
      const nearestRoom = Math.round(cameraZRef.current / ROOM_STRIDE)
      const center = roomCenterZ(nearestRoom)
      const snapForce = (center - cameraZRef.current) * 0.003
      cameraZRef.current += snapForce
    }

    const z = cameraZRef.current

    // Ensure rooms ahead are generated
    const lookAhead = Math.floor(z / ROOM_STRIDE) + 2
    ensureGenerated(lookAhead)

    // Subtle camera micro-drift (handheld feel)
    const t = elapsed
    const driftX = Math.sin(t * 0.23) * 0.04 + Math.sin(t * 0.41) * 0.02
    const driftY = Math.cos(t * 0.17) * 0.03 + Math.cos(t * 0.31) * 0.015

    // Camera floats forward along Z, looking slightly ahead
    _targetPos.set(driftX, 2 + driftY, -z)
    camera.position.lerp(_targetPos, clamp(dt * 8, 0, 1))

    // Look slightly ahead and down — apply user yaw around vertical axis at eye
    _lookTarget.set(driftX * 0.5, 1.4, -(z + 8))
    const dx = _lookTarget.x - camera.position.x
    const dy = _lookTarget.y - camera.position.y
    const dz = _lookTarget.z - camera.position.z
    const lenXZ = Math.hypot(dx, dz)
    if (lenXZ > 1e-5) {
      const hAngle = Math.atan2(dx, -dz)
      const nx = Math.sin(hAngle + yawRef.current) * lenXZ
      const nz = -Math.cos(hAngle + yawRef.current) * lenXZ
      _lookTarget.set(camera.position.x + nx, camera.position.y + dy, camera.position.z + nz)
    }
    _m.lookAt(camera.position, _lookTarget, _up)
    _targetQuat.setFromRotationMatrix(_m)
    _pitchQuat.setFromAxisAngle(_pitchAxis, pitchRef.current)
    _targetQuat.multiply(_pitchQuat)
    _camQuat.copy(camera.quaternion)
    _camQuat.slerp(_targetQuat, clamp(dt * 6, 0, 1))
    camera.quaternion.copy(_camQuat)

    // Sync to store
    setCameraZ(z)
  })

  return null
}
