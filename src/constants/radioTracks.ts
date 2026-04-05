/** Museum radio — files live in /public (Vite serves at root). Display labels are generic. */
export const RADIO_TRACKS = [
  { src: '/ghost_town.mp3', label: 'Track 1' },
  { src: '/no_child.mp3', label: 'Track 2' },
  { src: '/famous.mp3', label: 'Track 3' },
  { src: '/violent_crimes.mp3', label: 'Track 4' },
  { src: '/yandhi.mp3', label: 'Track 5' },
] as const

export const RADIO_TRACK_COUNT = RADIO_TRACKS.length
