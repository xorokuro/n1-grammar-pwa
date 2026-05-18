import { useState, useCallback } from 'react'
import type { UserData, StudyStatus } from '../types'

const KEY = 'n1-grammar-userdata'

function load(): UserData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { bookmarks: [], status: {} }
}

function save(data: UserData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function useUserData() {
  const [data, setData] = useState<UserData>(load)

  const update = useCallback((fn: (d: UserData) => UserData) => {
    setData(prev => {
      const next = fn(prev)
      save(next)
      return next
    })
  }, [])

  const toggleBookmark = useCallback((id: number) => {
    update(d => ({
      ...d,
      bookmarks: d.bookmarks.includes(id)
        ? d.bookmarks.filter(b => b !== id)
        : [...d.bookmarks, id],
    }))
  }, [update])

  const setStatus = useCallback((id: number, status: StudyStatus) => {
    update(d => ({
      ...d,
      status: { ...d.status, [id]: status },
    }))
  }, [update])

  return { data, toggleBookmark, setStatus }
}
