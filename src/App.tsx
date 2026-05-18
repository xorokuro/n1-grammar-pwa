import { useState } from 'react'
import type { GrammarPoint } from './types'
import { useUserData } from './hooks/useUserData'
import { GrammarList } from './components/GrammarList'
import { GrammarDetail } from './components/GrammarDetail'
import { ProgressScreen } from './components/ProgressScreen'
import { BottomNav } from './components/BottomNav'
import grammarData from './data/grammar.json'

const points = grammarData as GrammarPoint[]

type Tab = 'browse' | 'bookmarks' | 'progress'

export default function App() {
  const [tab, setTab] = useState<Tab>('browse')
  const [selected, setSelected] = useState<GrammarPoint | null>(null)
  const { data: userData, toggleBookmark, setStatus } = useUserData()

  const handleSelect = (p: GrammarPoint) => setSelected(p)
  const handleBack = () => setSelected(null)

  const handleNav = (p: GrammarPoint, dir: 1 | -1) => {
    const idx = points.findIndex(x => x.id === p.id)
    const next = points[idx + dir]
    if (next) setSelected(next)
  }

  if (selected) {
    const idx = points.findIndex(x => x.id === selected.id)
    return (
      <div className="h-screen overflow-hidden bg-slate-900 text-slate-100">
        <GrammarDetail
          point={selected}
          userData={userData}
          onBack={handleBack}
          onToggleBookmark={toggleBookmark}
          onSetStatus={setStatus}
          onPrev={idx > 0 ? () => handleNav(selected, -1) : undefined}
          onNext={idx < points.length - 1 ? () => handleNav(selected, 1) : undefined}
        />
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-4 pt-safe pt-4 pb-3 border-b border-slate-800">
        <h1 className="text-lg font-bold text-slate-100">
          N1 <span className="text-violet-400">文法</span>
        </h1>
        <p className="text-xs text-slate-500">150 grammar points</p>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {tab === 'browse' && (
          <GrammarList points={points} userData={userData} onSelect={handleSelect} />
        )}
        {tab === 'bookmarks' && (
          <div className="h-full overflow-y-auto">
            {userData.bookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <p className="text-4xl mb-3">★</p>
                <p className="text-sm">No saved grammar yet</p>
                <p className="text-xs mt-1">Tap ★ on any grammar point to save it</p>
              </div>
            ) : (
              <GrammarList points={points} userData={userData} onSelect={handleSelect} bookmarksOnly />
            )}
          </div>
        )}
        {tab === 'progress' && (
          <div className="h-full overflow-y-auto">
            <ProgressScreen points={points} userData={userData} />
          </div>
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} bookmarkCount={userData.bookmarks.length} />
    </div>
  )
}
