"use client"

import { useEffect, useState } from "react"
import { Character } from "@/lib/types"
import { getMyCreations, retryMesh } from "@/lib/api"
import { API_BASE } from "@/lib/api"
import { CharacterCard } from "@/components/character-card"
import { TrustDashboard } from "@/components/trust-dashboard"
import { ModelViewer } from "@/components/model-viewer"
import Link from "next/link"

const STORAGE_KEY = "builder_studio_user"

export default function MyCreationsPage() {
  const [troops, setTroops] = useState<Character[]>([])
  const [selected, setSelected] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<string | null>(null)
  const [forging, setForging] = useState(false)

  const handleForge3D = async (id: number) => {
    setForging(true)
    try {
      const res = await fetch(`${API_BASE}/characters/${id}/generate-3d`, { method: "POST" })
      if (res.ok) {
        const updated = await res.json()
        setSelected(updated)
        setTroops((prev) => prev.map((c) => (c.id === id ? updated : c)))
      }
    } finally {
      setForging(false)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setUser(stored)
    if (!stored) return
    getMyCreations(stored)
      .then(setTroops)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-stone-500 text-center py-20">Opening your barracks...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold italic tracking-tighter uppercase">My Troops</h1>
          <p className="text-stone-500 mt-1">{user} · {troops.length} troop{troops.length !== 1 ? "s" : ""} in your collection</p>
        </div>
        <Link href="/create" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-6 py-2 rounded-xl uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20">
          + Forge New Troop
        </Link>
      </div>

      {troops.length === 0 ? (
        <div className="text-center py-32 bg-stone-900/20 border border-dashed border-stone-800 rounded-3xl">
          <div className="text-6xl mb-6 grayscale opacity-30">🪖</div>
          <h2 className="text-xl font-bold text-stone-400">Your barracks are empty</h2>
          <p className="text-stone-600 mt-2 max-w-sm mx-auto">Build your first AI troop and see it come to life in 3D.</p>
          <Link href="/create" className="mt-8 inline-block text-amber-500 hover:text-amber-400 font-bold text-sm uppercase tracking-widest border border-amber-500/20 px-6 py-2 rounded-xl hover:bg-amber-500/10 transition-all">
            Start Building →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {troops.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              onClick={() => setSelected(selected?.id === c.id ? null : c)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setSelected(null)}>
          <div
            className="bg-stone-950 border border-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                    selected.status === "approved" ? "bg-green-950/40 border-green-800 text-green-400" :
                    selected.status === "rejected" ? "bg-red-950/40 border-red-800 text-red-400" :
                    "bg-amber-950/40 border-amber-800 text-amber-400"
                  }`}>
                    {selected.status.replace("_", " ")}
                  </span>
                  {selected.human_note && (
                    <span className="text-[10px] text-stone-500 italic">— {selected.human_note}</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{selected.emoji} {selected.name}</h2>
                <p className="text-stone-400 text-sm">{selected.archetype} · {selected.rarity} {selected.type}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-stone-600 hover:text-white text-xl p-2 transition-colors">✕</button>
            </div>

            {(selected.glb_url || selected.glb_status === "generating") ? (
              <ModelViewer
                characterId={selected.id}
                initialGlbUrl={selected.glb_url}
                initialGlbStatus={selected.glb_status}
              />
            ) : (
              <div className="aspect-square bg-stone-900 rounded-2xl flex flex-col items-center justify-center border border-stone-800 p-8 text-center space-y-4">
                <div className="text-5xl opacity-20">🗿</div>
                <div>
                  <h3 className="font-bold text-stone-300">3D Model Not Forged</h3>
                  <p className="text-sm text-stone-500 mt-1 max-w-xs">Transform your 2D portrait into a high-quality 3D mesh ready for the battlefield.</p>
                </div>
                <button
                  onClick={() => handleForge3D(selected.id)}
                  disabled={forging}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black px-8 py-3 rounded-xl uppercase tracking-widest text-sm transition-all shadow-lg shadow-purple-600/20"
                >
                  {forging ? "Forging..." : "Forge 3D Model"}
                </button>
              </div>
            )}

            {selected.glb_status === "failed" && (
              <div className="flex items-center justify-between bg-red-950/20 border border-red-900/30 rounded-xl px-4 py-3">
                <p className="text-sm text-red-400">3D Forge failed: {selected.glb_error || "Unknown error"}</p>
                <button
                  onClick={() => handleForge3D(selected.id)}
                  disabled={forging}
                  className="text-xs bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  {forging ? "Retrying..." : "Retry Forge"}
                </button>
              </div>
            )}

            {selected.abilities && (
              <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-3 font-bold">Abilities</div>
                <ul className="space-y-2">
                  {selected.abilities.map((a, i) => (
                    <li key={i} className="text-sm text-stone-300 flex gap-3 items-start">
                      <span className="text-amber-500 shrink-0">◈</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.lore && (
              <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-3 font-bold">Lore</div>
                <p className="text-sm text-stone-300 leading-relaxed italic">"{selected.lore}"</p>
              </div>
            )}

            <TrustDashboard character={selected} />
          </div>
        </div>
      )}
    </div>
  )
}
