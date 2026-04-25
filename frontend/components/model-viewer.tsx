"use client"

import React, { useEffect, useState } from "react"
import { getGlbStatus, API_BASE } from "@/lib/api"

interface Props {
  characterId: number
  initialGlbUrl: string | null
  initialGlbStatus: string | null
}

function resolveUrl(url: string | null): string | null {
  if (!url) return null
  return url.startsWith("http") ? url : `${API_BASE}${url}`
}

export function ModelViewer({ characterId, initialGlbUrl, initialGlbStatus }: Props) {
  const [glbUrl, setGlbUrl] = useState(initialGlbUrl)
  const [glbStatus, setGlbStatus] = useState(initialGlbStatus)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    import("@google/model-viewer").then(() => setReady(true))
  }, [])

  useEffect(() => {
    if (glbStatus !== "generating") return
    const timer = setInterval(async () => {
      try {
        const data = await getGlbStatus(characterId)
        setGlbStatus(data.glb_status)
        if (data.glb_url) setGlbUrl(data.glb_url)
        if (data.glb_status !== "generating") clearInterval(timer)
      } catch {}
    }, 5000)
    return () => clearInterval(timer)
  }, [glbStatus, characterId])

  const srcUrl = resolveUrl(glbUrl)

  if (glbStatus === "generating") {
    return (
      <div className="flex flex-col items-center justify-center h-56 bg-stone-900 rounded-xl border border-stone-700 gap-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-400">Generating 3D model...</p>
      </div>
    )
  }

  if (!srcUrl || !ready) return null

  return React.createElement("model-viewer", {
    src: srcUrl,
    "auto-rotate": true,
    "camera-controls": true,
    "shadow-intensity": "1",
    style: { width: "100%", height: "300px", borderRadius: "12px", background: "#1c1917" },
  })
}
