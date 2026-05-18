type Tab = 'browse' | 'bookmarks' | 'progress'

interface Props {
  active: Tab
  onChange: (t: Tab) => void
  bookmarkCount: number
}

const tabs: { id: Tab; label: string; icon: (active: boolean) => JSX.Element }[] = [
  {
    id: 'browse',
    label: 'Browse',
    icon: (a) => (
      <svg className="w-5 h-5" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h6" />
        {a && <path d="M4 6h16M4 10h16M4 14h10M4 18h6" strokeWidth={1.8} stroke="currentColor" fill="none" strokeLinecap="round" />}
      </svg>
    ),
  },
  {
    id: 'bookmarks',
    label: 'Saved',
    icon: (a) => (
      <svg className="w-5 h-5" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: (a) => (
      <svg className="w-5 h-5" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
]

export function BottomNav({ active, onChange, bookmarkCount }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 pb-safe z-20">
      <div className="flex">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              active === t.id ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="relative">
              {t.icon(active === t.id)}
              {t.id === 'bookmarks' && bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-violet-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold">
                  {bookmarkCount > 9 ? '9+' : bookmarkCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
