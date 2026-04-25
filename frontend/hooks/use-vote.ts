"use client"

import { useState, useEffect, useCallback } from "react"
import { voteCharacter } from "@/lib/api"

type VoteDirection = "up" | "down" | null

export function useVote(
  characterId: number,
  initialUpvotes: number,
  initialDownvotes: number
) {
  const storageKey = `vote_${characterId}`

  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [currentVote, setCurrentVote] = useState<VoteDirection>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored === "up" || stored === "down") {
      // Delay state update to avoid cascading renders warning
      setTimeout(() => setCurrentVote(stored), 0)
    }
  }, [storageKey])

  const vote = useCallback(
    async (direction: "up" | "down") => {
      if (loading) return
      setLoading(true)
      try {
        let result
        if (currentVote === direction) {
          result = await voteCharacter(characterId, direction, "remove")
          localStorage.removeItem(storageKey)
          setCurrentVote(null)
        } else {
          if (currentVote !== null) {
            await voteCharacter(characterId, currentVote, "remove")
          }
          result = await voteCharacter(characterId, direction, "cast")
          localStorage.setItem(storageKey, direction)
          setCurrentVote(direction)
        }
        setUpvotes(result.upvotes)
        setDownvotes(result.downvotes)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [characterId, currentVote, loading, storageKey]
  )

  return { upvotes, downvotes, currentVote, loading, vote }
}
