export interface GrammarPoint {
  id: number
  pattern: string
  englishConcept: string
  coreDefinitionZh: string
  vibe: string
  rawContent: string
}

export type StudyStatus = 'new' | 'reviewing' | 'learned'

export interface UserData {
  bookmarks: number[]
  status: Record<number, StudyStatus>
}
