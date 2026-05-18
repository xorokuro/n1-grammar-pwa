export interface GrammarPoint {
  id: number
  sourceId: string
  pattern: string
  romaji?: string
  partOfSpeech?: string
  englishConcept: string
  coreDefinitionZh: string
  vibe: string
  rawContent: string
  relatedIds?: number[]
}

export type StudyStatus = 'new' | 'reviewing' | 'learned'

export interface UserData {
  bookmarks: number[]
  status: Record<number, StudyStatus>
}

export interface Source {
  id: string
  name: string
  shortName: string
  level: string
  color: string
}
