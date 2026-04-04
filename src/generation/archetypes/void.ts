import type { PaletteConfig } from '../palettes'

export type VoidElementType = 'sphere' | 'monolith' | 'arch'

export interface VoidConfig {
  archetype: 'void'
  elementType: VoidElementType
  elementScale: number    // 0.5-2.0
  lightIntensity: number  // 2-8
  lightColor: string
  chamberScale: number    // 0.8-1.4
  fogDensity: number
  palette: PaletteConfig
}

const VOID_ELEMENTS: VoidElementType[] = ['sphere', 'monolith', 'arch']

export function buildVoidConfig(rng: () => number, palette: PaletteConfig): VoidConfig {
  return {
    archetype: 'void',
    elementType: VOID_ELEMENTS[Math.floor(rng() * VOID_ELEMENTS.length)],
    elementScale: 0.5 + rng() * 1.5,
    lightIntensity: 2 + rng() * 6,
    lightColor: palette.emissive,
    chamberScale: 0.8 + rng() * 0.6,
    fogDensity: 0.6 + rng() * 0.4,
    palette,
  }
}
