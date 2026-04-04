import type { PaletteConfig } from '../palettes'

export interface ObsidianConfig {
  archetype: 'obsidian'
  frameCount: number        // 4-8
  frameShaders: number[]    // indices into the 6 frame shaders
  fogDensity: number        // 0.4-1.0
  dustDensity: number       // 200-600 particles
  lightShaftIntensity: number
  palette: PaletteConfig
}

export function buildObsidianConfig(rng: () => number, palette: PaletteConfig): ObsidianConfig {
  const frameCount = 4 + Math.floor(rng() * 5)  // 4-8
  // Pick random subset of 6 shaders (indices 0-5)
  const allShaders = [0, 1, 2, 3, 4, 5]
  const shuffled = allShaders.sort(() => rng() - 0.5)
  const frameShaders = shuffled.slice(0, Math.min(frameCount, 6))

  return {
    archetype: 'obsidian',
    frameCount,
    frameShaders,
    fogDensity: 0.4 + rng() * 0.6,
    dustDensity: 200 + Math.floor(rng() * 400),
    lightShaftIntensity: 0.03 + rng() * 0.04,
    palette,
  }
}
