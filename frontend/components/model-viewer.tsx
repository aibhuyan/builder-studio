"use client"

import React, { useEffect, useState } from "react"
import { getGlbStatus, getRigStatus, API_BASE } from "@/lib/api"

interface Props {
  characterId: number
  initialGlbUrl: string | null
  initialGlbStatus: string | null
  initialRiggedGlbUrl: string | null
  initialRigStatus: string | null
}

function resolveUrl(url: string | null): string | null {
  if (!url) return null
  return url.startsWith("http") ? url : `${API_BASE}${url}`
}

export function ModelViewer({
  characterId,
  initialGlbUrl,
  initialGlbStatus,
  initialRiggedGlbUrl,
  initialRigStatus,
}: Props) {
  const [glbUrl, setGlbUrl] = useState(initialGlbUrl)
  const [glbStatus, setGlbStatus] = useState(initialGlbStatus)
  const [riggedGlbUrl, setRiggedGlbUrl] = useState(initialRiggedGlbUrl)
  const [rigStatus, setRigStatus] = useState(initialRigStatus)
  const [ready, setReady] = useState(false)

  // Load @google/model-viewer client-side only
  useEffect(() => {
    import("@google/model-viewer").then(() => setReady(true))
  }, [])

  // Poll GLB generation
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

  // Poll rigging
  useEffect(() => {
    if (rigStatus !== "rigging") return
    const timer = setInterval(async () => {
      try {
        const data = await getRigStatus(characterId)
        setRigStatus(data.rig_status)
        if (data.rigged_glb_url) setRiggedGlbUrl(data.rigged_glb_url)
        if (data.rig_status !== "rigging") clearInterval(timer)
      } catch {}
    }, 8000)
    return () => clearInterval(timer)
  }, [rigStatus, characterId])

  // Determine what to show
  const hasRig = rigStatus === "ready" && riggedGlbUrl
  const srcUrl = resolveUrl(hasRig ? riggedGlbUrl : glbUrl)
  const isGenerating = glbStatus === "generating"
  const isRigging = rigStatus === "rigging"

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-56 bg-stone-900 rounded-xl border border-stone-700 gap-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-400">Generating 3D model...</p>
      </div>
    )
  }

  if (!srcUrl || !ready) return null

  return (
    <div className="relative">
      {React.createElement("model-viewer", {
        src: srcUrl,
        "auto-rotate": true,
        "camera-controls": true,
        "shadow-intensity": "1",
        ...(hasRig ? { autoplay: true } : {}),
        style: { width: "100%", height: "300px", borderRadius: "12px", background: "#1c1917" },
      })}

      {/* Rig status overlay */}
      {isRigging && (
        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-stone-950/80 rounded-lg px-3 py-1.5">
          <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-amber-400">Rigging animation...</span>
        </div>
      )}
      {hasRig && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-stone-950/80 rounded-lg px-3 py-1.5">
          <span className="text-xs text-green-400">✦ Animated</span>
        </div>
      )}
    </div>
  )
}
