import type { GrammarPoint, UserData } from '../types'
import { SOURCES, getSourceColors } from '../data/sources'

interface Props {
  points: GrammarPoint[]      // filtered to activeSource
  allPoints: GrammarPoint[]   // all points for per-source breakdown
  userData: UserData
  activeSource: string
}

export function ProgressScreen({ points, allPoints, userData, activeSource }: Props) {
  const total = points.length
  const learned = points.filter(p => userData.status[p.id] === 'learned').length
  const reviewing = points.filter(p => userData.status[p.id] === 'reviewing').length
  const newCount = total - learned - reviewing
  const bookmarks = userData.bookmarks.filter(id =>
    points.some(p => p.id === id)
  ).length
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0

  return (
    <div className="px-4 pt-6 pb-24">
      <h2 className="text-xl font-bold text-slate-100 mb-6">Progress</h2>

      {/* Big ring */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="12" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke="#7c3aed" strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - learned / (total || 1))}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke="#d97706" strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - (learned + reviewing) / (total || 1))}`}
              strokeLinecap="round"
              style={{ opacity: 0.5 }}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-100">{pct}%</span>
            <span className="text-xs text-slate-400">mastered</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Learned" value={learned} color="text-emerald-400" bg="bg-emerald-900/20" />
        <StatCard label="Reviewing" value={reviewing} color="text-amber-400" bg="bg-amber-900/20" />
        <StatCard label="Not started" value={newCount} color="text-slate-400" bg="bg-slate-800" />
        <StatCard label="Bookmarked" value={bookmarks} color="text-amber-400" bg="bg-slate-800" icon="★" />
      </div>

      {/* Total */}
      <div className="bg-slate-800 rounded-2xl p-4 text-center mb-6">
        <p className="text-3xl font-bold text-violet-400">{total}</p>
        <p className="text-sm text-slate-400 mt-1">
          {activeSource === 'all' ? 'Total Grammar Points' : 'Grammar Points in View'}
        </p>
      </div>

      {/* Per-source breakdown (only shown in "all" view) */}
      {activeSource === 'all' && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">By Source</p>
          <div className="space-y-3">
            {SOURCES.map(src => {
              const srcPoints = allPoints.filter(p => p.sourceId === src.id)
              if (srcPoints.length === 0) return null
              const srcLearned = srcPoints.filter(p => userData.status[p.id] === 'learned').length
              const srcPct = Math.round((srcLearned / srcPoints.length) * 100)
              const colors = getSourceColors(src.id)
              return (
                <div key={src.id} className="bg-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className={`text-sm font-semibold ${colors.text}`}>{src.shortName}</span>
                      <span className="text-xs text-slate-500 ml-2">{src.level}</span>
                    </div>
                    <span className="text-sm text-slate-300">{srcLearned}/{srcPoints.length}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${colors.badge}`}
                      style={{ width: `${srcPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color, bg, icon }: { label: string; value: number; color: string; bg: string; icon?: string }) {
  return (
    <div className={`${bg} rounded-2xl p-4`}>
      <p className={`text-2xl font-bold ${color} mb-1`}>{icon && <span className="mr-1">{icon}</span>}{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}
