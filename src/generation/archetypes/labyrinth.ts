import type { PaletteConfig } from '../palettes'

export interface LabyrinthConfig {
  archetype: 'labyrinth'
  stripCount: number       // 2-6 neon strips
  stripIntensity: number   // emissive intensity 3-8
  fogDensity: number       // 0.3-0.8 (denser = shorter visible corridor)
  palette: PaletteConfig
}

export function buildLabyrinthConfig(rng: () => number, palette: PaletteConfig): LabyrinthConfig {
  return {
    archetype: 'labyrinth',
    stripCount: 2 + Math.floor(rng() * 5),
    stripIntensity: 3 + rng() * 5,
    fogDensity: 0.3 + rng() * 0.5,
    palette,
  }
}
