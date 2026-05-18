import type { GrammarPoint } from '../types'
import n1Raw from './grammar.json'
import dobjgRaw from './dobjg.json'

// Legacy grammar.json entries don't have sourceId — inject it here
const n1Points = (n1Raw as Omit<GrammarPoint, 'sourceId'>[]).map(p => ({
  ...p,
  sourceId: 'n1',
  relatedIds: [],
})) as GrammarPoint[]

const dobjgPoints = dobjgRaw as GrammarPoint[]

export const allGrammarPoints: GrammarPoint[] = [...n1Points, ...dobjgPoints]

// Add future sources here:
// import doijgRaw from './doijg.json'
// const doijgPoints = doijgRaw as GrammarPoint[]
// export const allGrammarPoints = [...n1Points, ...dobjgPoints, ...doijgPoints]
