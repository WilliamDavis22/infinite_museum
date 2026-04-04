import type { PaletteConfig } from '../palettes'

export interface CrystallineConfig {
  archetype: 'crystalline'
  crystalCount: number    // 12-30 crystal clusters
  lightCount: number      // 3-6 prismatic lights
  crystalHeight: number   // 1.5-5
  fogDensity: number
  palette: PaletteConfig
}

export function buildCrystallineConfig(rng: () => number, palette: PaletteConfig): CrystallineConfig {
  return {
    archetype: 'crystalline',
    crystalCount: 12 + Math.floor(rng() * 18),
    lightCount: 3 + Math.floor(rng() * 4),
    crystalHeight: 1.5 + rng() * 3.5,
    fogDensity: 0.4 + rng() * 0.4,
    palette,
  }
}
