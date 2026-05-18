import { SOURCES, getSourceColors } from '../data/sources'
import type { GrammarPoint } from '../types'

interface Props {
  active: string         // 'all' | sourceId
  points: GrammarPoint[] // all grammar points (to show counts per source)
  onChange: (sourceId: string) => void
}

export function SourceFilter({ active, points, onChange }: Props) {
  const totalCount = points.length

  const sourceCount = (id: string) =>
    points.filter(p => p.sourceId === id).length

  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide border-b border-slate-800">
      {/* All */}
      <SourcePill
        label="All"
        count={totalCount}
        isActive={active === 'all'}
        colorClass={active === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}
        onClick={() => onChange('all')}
      />

      {/* Per-source pills */}
      {SOURCES.map(src => {
        const colors = getSourceColors(src.id)
        const count = sourceCount(src.id)
        if (count === 0) return null
        const isActive = active === src.id
        return (
          <SourcePill
            key={src.id}
            label={src.shortName}
            sublabel={src.level}
            count={count}
            isActive={isActive}
            colorClass={isActive ? `${colors.badge} text-white` : `bg-slate-800 ${colors.text} hover:brightness-125`}
            onClick={() => onChange(src.id)}
          />
        )
      })}
    </div>
  )
}

interface PillProps {
  label: string
  sublabel?: string
  count: number
  isActive: boolean
  colorClass: string
  onClick: () => void
}

function SourcePill({ label, sublabel, count, isActive, colorClass, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${colorClass}`}
    >
      <span>{label}</span>
      {sublabel && !isActive && (
        <span className="opacity-60 text-[10px]">{sublabel}</span>
      )}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-700'}`}>
        {count}
      </span>
    </button>
  )
}
