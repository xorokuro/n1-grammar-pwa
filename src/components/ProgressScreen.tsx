import type { GrammarPoint, UserData } from '../types'

interface Props {
  points: GrammarPoint[]
  userData: UserData
}

export function ProgressScreen({ points, userData }: Props) {
  const total = points.length
  const learned = points.filter(p => userData.status[p.id] === 'learned').length
  const reviewing = points.filter(p => userData.status[p.id] === 'reviewing').length
  const newCount = total - learned - reviewing
  const bookmarks = userData.bookmarks.length
  const pct = Math.round((learned / total) * 100)

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
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - learned / total)}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke="#d97706" strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - (learned + reviewing) / total)}`}
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
      <div className="bg-slate-800 rounded-2xl p-4 text-center">
        <p className="text-3xl font-bold text-violet-400">{total}</p>
        <p className="text-sm text-slate-400 mt-1">Total N1 Grammar Points</p>
      </div>
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
