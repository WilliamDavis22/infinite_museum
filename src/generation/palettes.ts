export interface PaletteConfig {
  name: string
  bg: string
  primary: string
  accent: string
  emissive: string
  fogColor: string
  bloomColor: string
  bloomIntensity: number
  /** compatible archetypes */
  archetypes: string[]
}

export const PALETTES: PaletteConfig[] = [
  {
    name: 'OBSIDIAN_GOLD',
    bg: '#000000',
    primary: '#8B6914',
    accent: '#c8860a',
    emissive: '#ff9900',
    fogColor: '#0a0805',
    bloomColor: '#ff9900',
    bloomIntensity: 1.2,
    archetypes: ['obsidian', 'resonance', 'void'],
  },
  {
    name: 'VOID_CYAN',
    bg: '#000000',
    primary: '#00aacc',
    accent: '#00ffff',
    emissive: '#00ffff',
    fogColor: '#001520',
    bloomColor: '#00ffff',
    bloomIntensity: 1.8,
    archetypes: ['obsidian', 'resonance', 'labyrinth', 'void'],
  },
  {
    name: 'CRIMSON_DARK',
    bg: '#000000',
    primary: '#8b0000',
    accent: '#ff1744',
    emissive: '#ff3366',
    fogColor: '#0d0005',
    bloomColor: '#ff1744',
    bloomIntensity: 1.5,
    archetypes: ['obsidian', 'resonance', 'labyrinth'],
  },
  {
    name: 'EMERALD_NIGHT',
    bg: '#000000',
    primary: '#1a4a2e',
    accent: '#00e676',
    emissive: '#00c853',
    fogColor: '#000d05',
    bloomColor: '#00e676',
    bloomIntensity: 1.4,
    archetypes: ['obsidian', 'resonance', 'labyrinth'],
  },
  {
    name: 'ULTRAVIOLET',
    bg: '#000000',
    primary: '#4a0080',
    accent: '#9c27b0',
    emissive: '#e040fb',
    fogColor: '#08000f',
    bloomColor: '#e040fb',
    bloomIntensity: 2.0,
    archetypes: ['resonance', 'crystalline', 'labyrinth'],
  },
  {
    name: 'MOONSILVER',
    bg: '#000000',
    primary: '#1a2a4a',
    accent: '#90caf9',
    emissive: '#e3f2fd',
    fogColor: '#020508',
    bloomColor: '#90caf9',
    bloomIntensity: 1.6,
    archetypes: ['obsidian', 'resonance', 'crystalline', 'void'],
  },
  {
    name: 'RUST_IRON',
    bg: '#000000',
    primary: '#5d2906',
    accent: '#ff6d00',
    emissive: '#ff9800',
    fogColor: '#0d0500',
    bloomColor: '#ff6d00',
    bloomIntensity: 1.3,
    archetypes: ['obsidian', 'void'],
  },
  {
    name: 'MONOCHROME',
    bg: '#000000',
    primary: '#222222',
    accent: '#ffffff',
    emissive: '#eeeeee',
    fogColor: '#050505',
    bloomColor: '#ffffff',
    bloomIntensity: 2.5,
    archetypes: ['void', 'crystalline'],
  },
]

export function getPalettesForArchetype(archetype: string): PaletteConfig[] {
  return PALETTES.filter((p) => p.archetypes.includes(archetype))
}
