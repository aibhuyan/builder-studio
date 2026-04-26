"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "shadow_barrack_picks"

export function useShadowBarrack() {
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

  return { pickedIds, isPicked, togglePick }
}
