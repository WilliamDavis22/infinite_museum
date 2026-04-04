/** Mulberry32 — fast, high-quality 32-bit seeded PRNG */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Get a per-room RNG using Knuth multiplicative hash to keep rooms independent */
export function roomRng(masterSeed: number, roomIndex: number): () => number {
  const roomSeed = (masterSeed ^ (roomIndex * 2654435761)) >>> 0
  return mulberry32(roomSeed)
}

/** Pick a random item from an array using the given rng */
export function pickFrom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

/** Pick a weighted item. weights must match arr length and sum to ~1 (or any positive total) */
export function weightedPick<T>(arr: T[], weights: number[], rng: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i]
    if (r <= 0) return arr[i]
  }
  return arr[arr.length - 1]
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
