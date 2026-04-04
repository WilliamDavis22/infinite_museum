import type { PaletteConfig } from '../palettes'

export type SculptureType = 'icosahedron' | 'nestedTori' | 'shatteredSphere' | 'helixColumn' | 'mobiusStrip'

export interface ResonanceConfig {
  archetype: 'resonance'
  sculptureType: SculptureType
  orbitCount: number        // 2-5
  orbitRadius: number       // 2.5-5
  orbitSpeed: number        // 0.2-0.7
  particleDensity: number   // 300-800
  fogDensity: number
  palette: PaletteConfig
}

const SCULPTURE_TYPES: SculptureType[] = [
  'icosahedron', 'nestedTori', 'shatteredSphere', 'helixColumn', 'mobiusStrip',
]

export function buildResonanceConfig(rng: () => number, palette: PaletteConfig): ResonanceConfig {
  return {
    archetype: 'resonance',
    sculptureType: SCULPTURE_TYPES[Math.floor(rng() * SCULPTURE_TYPES.length)],
    orbitCount: 2 + Math.floor(rng() * 4),
    orbitRadius: 2.5 + rng() * 2.5,
    orbitSpeed: 0.2 + rng() * 0.5,
    particleDensity: 300 + Math.floor(rng() * 500),
    fogDensity: 0.5 + rng() * 0.5,
    palette,
  }
}
