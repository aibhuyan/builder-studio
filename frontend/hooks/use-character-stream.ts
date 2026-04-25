"use client"

import { useState, useCallback } from "react"
import { AgentStep } from "@/lib/types"
import { API_BASE } from "@/lib/api"

export type StreamStatus = "idle" | "streaming" | "done" | "error"

export interface TroopFormData {
  troop_name: string
  archetype_template: string
  target_preference: string
  special_ability: string
  weakness: string
  creative_prompt?: string
}

export interface StreamState {
  status: StreamStatus
  stage: string
  stageMessage: string
  steps: AgentStep[]
  portraitUrl: string | null
  characterId: number | null
  error: string | null
}

const INITIAL_STATE: StreamState = {
  status: "idle",
  stage: "",
  stageMessage: "",
  steps: [],
  portraitUrl: null,
  characterId: null,
  error: null,
}

export function useCharacterStream() {
  const [state, setState] = useState<StreamState>(INITIAL_STATE)

  const generate = useCallback(async (formData: TroopFormData) => {
    setState({ ...INITIAL_STATE, status: "streaming" })

    try {
      const response = await fetch(`${API_BASE}/characters/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to start generation")
      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        let currentEvent = ""
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))

            if (currentEvent === "stage") {
              setState((prev) => ({ ...prev, stage: data.stage, stageMessage: data.message }))
            } else if (currentEvent === "step") {
              setState((prev) => ({
                ...prev,
                steps: [...prev.steps, { type: "step", step: data.step, detail: data.detail }],
              }))
            } else if (currentEvent === "portrait") {
              setState((prev) => ({ ...prev, portraitUrl: data.url }))
            } else if (currentEvent === "done") {
              setState((prev) => ({ ...prev, status: "done", characterId: data.character_id }))
            } else if (currentEvent === "error") {
              setState((prev) => ({ ...prev, status: "error", error: data.message }))
            }
          }
        }
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      }))
    }
  }, [])

  const reset = useCallback(() => setState(INITIAL_STATE), [])

  return { state, generate, reset }
}
