import type { Source } from '../types'

export const SOURCES: Source[] = [
  {
    id: 'n1',
    name: 'N1 Grammar Points',
    shortName: 'N1',
    level: 'N1',
    color: 'violet',
  },
  {
    id: 'dobjg',
    name: 'Dictionary of Basic Japanese Grammar',
    shortName: 'Basic',
    level: 'N5–N3',
    color: 'blue',
  },
]

// Full Tailwind class sets per sourceId — full strings needed for Tailwind purge
export const SOURCE_COLORS: Record<string, {
  text: string; bg: string; badge: string; ring: string; border: string
}> = {
  n1:    { text: 'text-violet-400', bg: 'bg-violet-900/30', badge: 'bg-violet-600', ring: 'ring-violet-500', border: 'border-violet-700' },
  dobjg: { text: 'text-blue-400',   bg: 'bg-blue-900/30',   badge: 'bg-blue-600',   ring: 'ring-blue-500',   border: 'border-blue-700'   },
  doijg: { text: 'text-emerald-400', bg: 'bg-emerald-900/30', badge: 'bg-emerald-600', ring: 'ring-emerald-500', border: 'border-emerald-700' },
  doajg: { text: 'text-orange-400', bg: 'bg-orange-900/30', badge: 'bg-orange-600', ring: 'ring-orange-500', border: 'border-orange-700' },
  n2:    { text: 'text-amber-400',  bg: 'bg-amber-900/30',  badge: 'bg-amber-600',  ring: 'ring-amber-500',  border: 'border-amber-700'  },
  n3:    { text: 'text-cyan-400',   bg: 'bg-cyan-900/30',   badge: 'bg-cyan-600',   ring: 'ring-cyan-500',   border: 'border-cyan-700'   },
  n4:    { text: 'text-pink-400',   bg: 'bg-pink-900/30',   badge: 'bg-pink-600',   ring: 'ring-pink-500',   border: 'border-pink-700'   },
  n5:    { text: 'text-rose-400',   bg: 'bg-rose-900/30',   badge: 'bg-rose-600',   ring: 'ring-rose-500',   border: 'border-rose-700'   },
}

export function getSourceColors(sourceId: string) {
  return SOURCE_COLORS[sourceId] ?? SOURCE_COLORS['n1']
}

export function getSource(id: string): Source | undefined {
  return SOURCES.find(s => s.id === id)
}

// To add a new source: create its JSON data file (with IDs in the reserved range below),
// import it in allGrammar.ts, and add a Source entry to SOURCES above.
//
// Reserved ID ranges:
//   n1:    1  – 999
//   dobjg: 1001 – 1999
//   doijg: 2001 – 2999
//   doajg: 3001 – 3999
//   n2:    4001 – 4999
//   n3:    5001 – 5999
//   n4:    6001 – 6999
//   n5:    7001 – 7999
