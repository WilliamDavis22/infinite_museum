import type { RoomConfig } from '@/generation/roomGenerator'
import { ObsidianRoom } from './rooms/ObsidianRoom'
import { ResonanceRoom } from './rooms/ResonanceRoom'
import { LabyrinthRoom } from './rooms/LabyrinthRoom'
import { VoidRoom } from './rooms/VoidRoom'
import { CrystallineRoom } from './rooms/CrystallineRoom'
import type { ObsidianConfig } from '@/generation/archetypes/obsidian'
import type { ResonanceConfig } from '@/generation/archetypes/resonance'
import type { LabyrinthConfig } from '@/generation/archetypes/labyrinth'
import type { VoidConfig } from '@/generation/archetypes/void'
import type { CrystallineConfig } from '@/generation/archetypes/crystalline'
import { Corridor } from './Corridor'
import { ROOM_DEPTH } from '@/generation/roomGenerator'

interface Props {
  config: RoomConfig
}

export function RoomRenderer({ config }: Props) {
  const { variant, zOffset, archetype } = config

  // Corridor appears at the end of each room connecting to the next
  const corridorZ = zOffset + ROOM_DEPTH  // at the end wall of the room
  const palette = variant.palette

  function renderRoom() {
    switch (archetype) {
      case 'obsidian':
        return <ObsidianRoom config={variant as ObsidianConfig} zOffset={zOffset} />
      case 'resonance':
        return <ResonanceRoom config={variant as ResonanceConfig} zOffset={zOffset} />
      case 'labyrinth':
        return <LabyrinthRoom config={variant as LabyrinthConfig} zOffset={zOffset} />
      case 'void':
        return <VoidRoom config={variant as VoidConfig} zOffset={zOffset} />
      case 'crystalline':
        return <CrystallineRoom config={variant as CrystallineConfig} zOffset={zOffset} />
    }
  }

  return (
    <>
      {renderRoom()}
      <Corridor
        position={[0, 0, -(corridorZ + 6)]}  // centered in the 12-unit corridor
        accentColor={palette.accent}
        emissiveColor={palette.emissive}
      />
    </>
  )
}
