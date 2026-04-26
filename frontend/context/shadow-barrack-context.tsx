"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "shadow_barrack_picks"

interface ShadowBarrackContextType {
  pickedIds: number[]
  isPicked: (id: number) => boolean
  togglePick: (id: number) => void
}

const ShadowBarrackContext = createContext<ShadowBarrackContextType | undefined>(undefined)

export function ShadowBarrackProvider({ children }: { children: React.ReactNode }) {
  const [pickedIds, setPickedIds] = useState<number[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setPickedIds(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse shadow barrack picks", e)
      }
    }
  }, [])

  const isPicked = useCallback((id: number) => {
    return pickedIds.includes(id)
  }, [pickedIds])

  const togglePick = useCallback((id: number) => {
    setPickedIds((prev) => {
      let next
      if (prev.includes(id)) {
        next = prev.filter((p) => p !== id)
      } else {
        next = [...prev, id]
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

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
