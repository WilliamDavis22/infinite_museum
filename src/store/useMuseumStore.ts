import { create } from 'zustand'
import { generateRoom, type RoomConfig, ROOM_STRIDE } from '@/generation/roomGenerator'

/** Read seed from URL hash or generate a random one */
function parseSeed(): number {
  const hash = window.location.hash
  const match = hash.match(/seed=([0-9a-fA-F]+)/)
  if (match) {
    const s = parseInt(match[1], 16)
    if (!isNaN(s)) return s >>> 0
  }
  const seed = (Math.random() * 0xffffffff) >>> 0
  window.location.hash = `seed=${seed.toString(16).toUpperCase()}`
  return seed
}

interface MuseumState {
  seed: number
  cameraZ: number
  roomIndex: number
  roomSequence: RoomConfig[]
  shatterTriggered: boolean
  isLoaded: boolean
  autoTour: boolean
  autoTourSpeed: number  // 0.5 – 10.0

  // Actions
  setCameraZ: (z: number) => void
  setRoomIndex: (i: number) => void
  ensureGenerated: (upToIndex: number) => void
  triggerShatter: () => void
  resetShatter: () => void
  setLoaded: () => void
  setAutoTour: (v: boolean) => void
  setAutoTourSpeed: (v: number) => void
}

export const useMuseumStore = create<MuseumState>((set, get) => ({
  seed: parseSeed(),
  cameraZ: 0,
  roomIndex: 0,
  roomSequence: [],
  shatterTriggered: false,
  isLoaded: false,
  autoTour: true,
  autoTourSpeed: 1.5,

  setCameraZ: (z) => {
    const roomIndex = Math.max(0, Math.floor(z / ROOM_STRIDE))
    set({ cameraZ: Math.max(0, z), roomIndex })
  },

  setRoomIndex: (i) => set({ roomIndex: Math.max(0, i) }),

  ensureGenerated: (upToIndex) => {
    const { seed, roomSequence } = get()
    if (roomSequence.length > upToIndex) return

    const newRooms = [...roomSequence]
    for (let i = newRooms.length; i <= upToIndex; i++) {
      const prevArchetype = i > 0 ? newRooms[i - 1].archetype : undefined
      newRooms.push(generateRoom(seed, i, prevArchetype))
    }
    set({ roomSequence: newRooms })
  },

  triggerShatter: () => set({ shatterTriggered: true }),
  resetShatter: () => set({ shatterTriggered: false }),
  setLoaded: () => set({ isLoaded: true }),
  setAutoTour: (v) => set({ autoTour: v }),
  setAutoTourSpeed: (v) => set({ autoTourSpeed: v }),
}))

/** Room center Z for a given room index */
export function roomCenterZ(index: number): number {
  return index * ROOM_STRIDE + 20
}
