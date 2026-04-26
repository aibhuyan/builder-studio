"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

const USER_KEY = "builder_studio_user"
const STORAGE_PREFIX = "shadow_barrack_picks_"

interface ShadowBarrackContextType {
  pickedIds: number[]
  isPicked: (id: number) => boolean
  togglePick: (id: number) => void
}

const ShadowBarrackContext = createContext<ShadowBarrackContextType | undefined>(undefined)

export function ShadowBarrackProvider({ children }: { children: React.ReactNode }) {
  const [pickedIds, setPickedIds] = useState<number[]>([])
  const [user, setUser] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = localStorage.getItem(USER_KEY)
    setUser(currentUser)
    if (currentUser) {
      const stored = localStorage.getItem(STORAGE_PREFIX + currentUser)
      setPickedIds(stored ? JSON.parse(stored) : [])
    }
  }, [])

  // Sync when user changes (polled because login/logout are external)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentUser = localStorage.getItem(USER_KEY)
      if (currentUser !== user) {
        setUser(currentUser)
        if (currentUser) {
          const stored = localStorage.getItem(STORAGE_PREFIX + currentUser)
          setPickedIds(stored ? JSON.parse(stored) : [])
        } else {
          setPickedIds([])
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [user])

  const isPicked = useCallback((id: number) => {
    return pickedIds.includes(id)
  }, [pickedIds])

  const togglePick = useCallback((id: number) => {
    if (!user) return
    setPickedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      localStorage.setItem(STORAGE_PREFIX + user, JSON.stringify(next))
      return next
    })
  }, [user])

  return (
    <ShadowBarrackContext.Provider value={{ pickedIds, isPicked, togglePick }}>
      {children}
    </ShadowBarrackContext.Provider>
  )
}

export function useShadowBarrack() {
  const context = useContext(ShadowBarrackContext)
  if (context === undefined) {
    throw new Error("useShadowBarrack must be used within a ShadowBarrackProvider")
  }
  return context
}
