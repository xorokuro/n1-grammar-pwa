import type { StudyStatus } from '../types'

const config: Record<StudyStatus, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-slate-700 text-slate-300' },
  reviewing: { label: 'Reviewing', cls: 'bg-amber-900/60 text-amber-300' },
  learned: { label: 'Learned', cls: 'bg-emerald-900/60 text-emerald-300' },
}

export function StatusBadge({ status }: { status: StudyStatus }) {
  const { label, cls } = config[status]
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  )
}
