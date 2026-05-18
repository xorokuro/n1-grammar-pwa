import { useState } from 'react'
import type { GrammarPoint } from './types'
import { useUserData } from './hooks/useUserData'
import { GrammarList } from './components/GrammarList'
import { GrammarDetail } from './components/GrammarDetail'
import { ProgressScreen } from './components/ProgressScreen'
import { BottomNav } from './components/BottomNav'
import { SourceFilter } from './components/SourceFilter'
import { allGrammarPoints } from './data/allGrammar'
import { SOURCES } from './data/sources'

type Tab = 'browse' | 'bookmarks' | 'progress'

export default function App() {
  const [tab, setTab] = useState<Tab>('browse')
  const [selected, setSelected] = useState<GrammarPoint | null>(null)
  const [activeSource, setActiveSource] = useState<string>('all')
  const { data: userData, toggleBookmark, setStatus } = useUserData()

  // Points filtered by active source (used for the list + navigation)
  const filteredPoints = activeSource === 'all'
    ? allGrammarPoints
    : allGrammarPoints.filter(p => p.sourceId === activeSource)

  const handleSelect = (p: GrammarPoint) => setSelected(p)
  const handleBack = () => setSelected(null)

  const handleNav = (p: GrammarPoint, dir: 1 | -1) => {
    const idx = filteredPoints.findIndex(x => x.id === p.id)
    const next = filteredPoints[idx + dir]
    if (next) setSelected(next)
  }

  const handleSourceChange = (sourceId: string) => {
    setActiveSource(sourceId)
    setSelected(null)
  }

  if (selected) {
    const idx = filteredPoints.findIndex(x => x.id === selected.id)
    return (
      <div className="h-screen overflow-hidden bg-slate-900 text-slate-100">
        <GrammarDetail
          point={selected}
          userData={userData}
          onBack={handleBack}
          onToggleBookmark={toggleBookmark}
          onSetStatus={setStatus}
          onPrev={idx > 0 ? () => handleNav(selected, -1) : undefined}
          onNext={idx < filteredPoints.length - 1 ? () => handleNav(selected, 1) : undefined}
        />
      </div>
    )
  }

  // Active source label for header
  const activeSrc = activeSource === 'all'
    ? null
    : SOURCES.find(s => s.id === activeSource)

  return (
    <div className="h-screen overflow-hidden bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-4 pt-safe pt-4 pb-2 border-b border-slate-800">
        <h1 className="text-lg font-bold text-slate-100">
          {activeSrc ? (
            <>
              <span className="text-slate-300">{activeSrc.shortName}</span>{' '}
              <span className={`text-sm font-normal`} style={{ color: 'inherit' }}>
                {activeSrc.level}
              </span>
            </>
          ) : (
            <>JP <span className="text-violet-400">文法</span></>
          )}
        </h1>
        <p className="text-xs text-slate-500">{filteredPoints.length} grammar points</p>
      </header>

      {/* Source filter pills */}
      <SourceFilter
        active={activeSource}
        points={allGrammarPoints}
        onChange={handleSourceChange}
      />

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {tab === 'browse' && (
          <GrammarList
            points={filteredPoints}
            userData={userData}
            onSelect={handleSelect}
            showSourceBadge={activeSource === 'all'}
          />
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
              <GrammarList
                points={filteredPoints}
                userData={userData}
                onSelect={handleSelect}
                bookmarksOnly
                showSourceBadge={activeSource === 'all'}
              />
            )}
          </div>
        )}
        {tab === 'progress' && (
          <div className="h-full overflow-y-auto">
            <ProgressScreen
              points={filteredPoints}
              allPoints={allGrammarPoints}
              userData={userData}
              activeSource={activeSource}
            />
          </div>
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} bookmarkCount={userData.bookmarks.length} />
    </div>
  )
}
