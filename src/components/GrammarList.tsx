import { useState, useMemo } from 'react'
import type { GrammarPoint, StudyStatus, UserData } from '../types'
import { StatusBadge } from './StatusBadge'

interface Props {
  points: GrammarPoint[]
  userData: UserData
  onSelect: (p: GrammarPoint) => void
  bookmarksOnly?: boolean
}

type FilterStatus = 'all' | StudyStatus

export function GrammarList({ points, userData, onSelect, bookmarksOnly = false }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')

  const visible = useMemo(() => {
    let list = bookmarksOnly
      ? points.filter(p => userData.bookmarks.includes(p.id))
      : points

    if (filter !== 'all') {
      list = list.filter(p => (userData.status[p.id] ?? 'new') === filter)
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        p =>
          p.pattern.toLowerCase().includes(q) ||
          p.englishConcept.toLowerCase().includes(q) ||
          p.coreDefinitionZh.includes(q) ||
          String(p.id).includes(q)
      )
    }
    return list
  }, [points, userData, query, filter, bookmarksOnly])

  const filters: FilterStatus[] = ['all', 'new', 'reviewing', 'learned']
  const filterLabels: Record<FilterStatus, string> = {
    all: 'All', new: 'New', reviewing: 'Review', learned: 'Learned'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search grammar, #number, English..."
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Filter chips */}
      {!bookmarksOnly && (
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                filter === f
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      )}

      {/* Count */}
      <div className="px-4 pb-2">
        <p className="text-xs text-slate-500">{visible.length} grammar points</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2">
        {visible.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-3xl mb-3">🔍</p>
            <p>No results found</p>
          </div>
        ) : (
          visible.map(p => {
            const status: StudyStatus = userData.status[p.id] ?? 'new'
            const isBookmarked = userData.bookmarks.includes(p.id)
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className="w-full text-left bg-slate-800 hover:bg-slate-750 active:bg-slate-700 rounded-2xl p-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-violet-400 font-bold">#{String(p.id).padStart(2, '0')}</span>
                      {isBookmarked && <span className="text-amber-400 text-xs">★</span>}
                      <StatusBadge status={status} />
                    </div>
                    <p className="font-semibold text-slate-100 text-base leading-snug mb-1">{p.pattern}</p>
                    {p.englishConcept && (
                      <p className="text-sm text-slate-400 truncate">{p.englishConcept}</p>
                    )}
                  </div>
                  <svg className="flex-shrink-0 w-4 h-4 text-slate-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
