import { useEffect, useRef } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { GrammarPoint, StudyStatus, UserData } from '../types'
import { StatusBadge } from './StatusBadge'
import { getSourceColors, SOURCES } from '../data/sources'

interface Props {
  point: GrammarPoint
  userData: UserData
  onBack: () => void
  onToggleBookmark: (id: number) => void
  onSetStatus: (id: number, s: StudyStatus) => void
  onPrev?: () => void
  onNext?: () => void
}

marked.setOptions({ breaks: true })

function renderMd(md: string): string {
  const html = marked.parse(md) as string
  return DOMPurify.sanitize(html)
}

const statusNext: Record<StudyStatus, StudyStatus> = {
  new: 'reviewing',
  reviewing: 'learned',
  learned: 'new',
}
const statusIcon: Record<StudyStatus, string> = {
  new: '○',
  reviewing: '◑',
  learned: '●',
}

function pointLabel(p: GrammarPoint): string {
  if (p.sourceId === 'n1') return `#${String(p.id).padStart(2, '0')}`
  return p.romaji ?? p.sourceId.toUpperCase()
}

export function GrammarDetail({ point, userData, onBack, onToggleBookmark, onSetStatus, onPrev, onNext }: Props) {
  const status: StudyStatus = userData.status[point.id] ?? 'new'
  const isBookmarked = userData.bookmarks.includes(point.id)
  const contentRef = useRef<HTMLDivElement>(null)
  const colors = getSourceColors(point.sourceId)
  const src = SOURCES.find(s => s.id === point.sourceId)

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0)
  }, [point.id])

  const html = renderMd(point.rawContent)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 active:bg-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-mono font-bold ${colors.text}`}>{pointLabel(point)}</span>
            {src && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colors.badge} text-white`}>
                {src.shortName}
              </span>
            )}
          </div>
          <span className="font-semibold text-sm text-slate-100 truncate block">{point.pattern}</span>
        </div>
        <button
          onClick={() => onToggleBookmark(point.id)}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors"
        >
          <span className={`text-lg ${isBookmarked ? 'text-amber-400' : 'text-slate-600'}`}>★</span>
        </button>
      </div>

      {/* Quick info bar */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800">
        {point.partOfSpeech && (
          <p className="text-xs text-slate-500 mb-1 font-mono">{point.partOfSpeech}</p>
        )}
        {point.englishConcept && (
          <p className="text-sm text-violet-300 font-medium mb-1">"{point.englishConcept}"</p>
        )}
        {point.coreDefinitionZh && (
          <p className="text-sm text-slate-300 line-clamp-2">{point.coreDefinitionZh}</p>
        )}
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto pb-32">
        <div
          className="grammar-content px-4 py-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Related entries (shown when relatedIds is populated) */}
        {(point.relatedIds?.length ?? 0) > 0 && (
          <div className="px-4 pb-8">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Related Grammar
            </p>
            <div className="space-y-2">
              {point.relatedIds!.map(rid => (
                <div key={rid} className="bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400">
                  #{rid}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 pb-safe">
        <div className="mx-4 mb-4 flex items-center gap-3 bg-slate-800 rounded-2xl px-4 py-3 shadow-xl border border-slate-700">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 disabled:opacity-30 active:bg-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => onSetStatus(point.id, statusNext[status])}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-1.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 transition-colors"
          >
            <span className="text-base">{statusIcon[status]}</span>
            <StatusBadge status={status} />
            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button
            onClick={onNext}
            disabled={!onNext}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 disabled:opacity-30 active:bg-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
