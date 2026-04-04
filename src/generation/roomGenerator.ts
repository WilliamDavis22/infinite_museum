import { roomRng, weightedPick, pickFrom } from './rng'
import { getPalettesForArchetype } from './palettes'
import { buildObsidianConfig, type ObsidianConfig } from './archetypes/obsidian'
import { buildResonanceConfig, type ResonanceConfig } from './archetypes/resonance'
import { buildLabyrinthConfig, type LabyrinthConfig } from './archetypes/labyrinth'
import { buildVoidConfig, type VoidConfig } from './archetypes/void'
import { buildCrystallineConfig, type CrystallineConfig } from './archetypes/crystalline'

export type ArchetypeKey = 'obsidian' | 'resonance' | 'labyrinth' | 'void' | 'crystalline'

export type RoomVariantConfig =
  | ObsidianConfig
  | ResonanceConfig
  | LabyrinthConfig
  | VoidConfig
  | CrystallineConfig

export interface RoomConfig {
  id: string
  roomIndex: number
  archetype: ArchetypeKey
  variant: RoomVariantConfig
  zOffset: number
  isRare: boolean
}

export const ROOM_DEPTH = 40
export const CORRIDOR_DEPTH = 12
export const ROOM_STRIDE = ROOM_DEPTH + CORRIDOR_DEPTH  // 52 units per room slot

const ARCHETYPES: ArchetypeKey[] = ['obsidian', 'resonance', 'labyrinth', 'void', 'crystalline']
const BASE_WEIGHTS = [0.28, 0.28, 0.22, 0.1, 0.12]

export function generateRoom(masterSeed: number, roomIndex: number, prevArchetype?: ArchetypeKey): RoomConfig {
  const rng = roomRng(masterSeed, roomIndex)

  // Adjust weights: VOID cannot appear twice in a row
  const weights = [...BASE_WEIGHTS]
  if (prevArchetype === 'void') {
    weights[3] = 0  // no void
  }

  const archetype = weightedPick(ARCHETYPES, weights, rng)
  const isRare = archetype === 'crystalline'

  const compatiblePalettes = getPalettesForArchetype(archetype)
  const palette = pickFrom(compatiblePalettes, rng)

  let variant: RoomVariantConfig
  switch (archetype) {
    case 'obsidian':
      variant = buildObsidianConfig(rng, palette)
      break
    case 'resonance':
      variant = buildResonanceConfig(rng, palette)
      break
    case 'labyrinth':
      variant = buildLabyrinthConfig(rng, palette)
      break
    case 'void':
      variant = buildVoidConfig(rng, palette)
      break
    case 'crystalline':
      variant = buildCrystallineConfig(rng, palette)
      break
  }

  return {
    id: `${masterSeed}-${roomIndex}`,
    roomIndex,
    archetype,
    variant,
    zOffset: roomIndex * ROOM_STRIDE,
    isRare,
  }
}
