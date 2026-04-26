"use client"

import { useEffect, useState } from "react"
import { Character } from "@/lib/types"
import { getCharacters, retryMesh } from "@/lib/api"
import { CharacterCard } from "@/components/character-card"
import { TrustDashboard } from "@/components/trust-dashboard"
import { ModelViewer } from "@/components/model-viewer"
import { useShadowBarrack } from "@/hooks/use-shadow-barrack"
import Link from "next/link"

export default function ShadowBarrackPage() {
  const [allCharacters, setAllCharacters] = useState<Character[]>([])
  const [selected, setSelected] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const { pickedIds } = useShadowBarrack()

  const handleRetryMesh = async (id: number) => {
    setRetrying(true)
    try {
      const updated = await retryMesh(id)
      setSelected(updated)
      setAllCharacters((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } finally {
      setRetrying(false)
    }
  }

  useEffect(() => {
    getCharacters()
      .then(setAllCharacters)
      .finally(() => setLoading(false))
  }, [])

  const pickedCharacters = allCharacters.filter((c) => pickedIds.includes(c.id))

  if (loading) {
    return <div className="text-stone-500 text-center py-20">Opening your Shadow Barrack...</div>
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-stone-900/60 border border-amber-900/30 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-amber-500 font-black text-sm uppercase tracking-widest mb-0.5">
            Shadow Barrack
          </div>
          <p className="text-stone-400 text-sm">
            Your personal collection of picked troops. Ready for deployment.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs text-stone-600 uppercase tracking-wide">Total Troops</div>
          <div className="text-amber-500 font-black text-lg mt-0.5">
            {pickedCharacters.length}
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold italic tracking-tighter uppercase">Shadow Barrack</h1>
        <p className="text-stone-500 mt-1">Review your selected arsenal</p>
      </div>

      {pickedCharacters.length === 0 ? (
        <div className="text-center py-24 bg-stone-900/20 border border-dashed border-stone-800 rounded-3xl">
          <div className="text-6xl mb-6 grayscale opacity-30">🏰</div>
          <h2 className="text-xl font-bold text-stone-400">Your Shadow Barrack is empty</h2>
          <p className="text-stone-600 mt-2 max-w-sm mx-auto">
            Head over to the Troops Ground to scout and pick troops for your personal barracks.
          </p>
          <Link 
            href="/roster" 
            className="text-amber-500 hover:text-amber-400 font-bold text-sm mt-6 inline-block uppercase tracking-widest border border-amber-500/20 px-6 py-2 rounded-xl hover:bg-amber-500/10 transition-all"
          >
            Visit Troops Ground →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pickedCharacters.map((c) => (
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
                <h2 className="text-2xl font-bold">{selected.emoji} {selected.name}</h2>
                <p className="text-stone-400 text-sm">{selected.archetype} · {selected.rarity} {selected.type}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-stone-600 hover:text-white text-xl p-2 transition-colors">✕</button>
            </div>

            {(selected.glb_url || selected.glb_status === "generating") && (
              <ModelViewer
                characterId={selected.id}
                initialGlbUrl={selected.glb_url}
                initialGlbStatus={selected.glb_status}
              />
            )}

            {selected.glb_status === "failed" && (
              <div className="flex items-center justify-between bg-stone-900 border border-stone-700 rounded-xl px-4 py-3">
                <p className="text-sm text-stone-400">3D model generation failed.</p>
                <button
                  onClick={() => handleRetryMesh(selected.id)}
                  disabled={retrying}
                  className="text-xs bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  {retrying ? "Retrying..." : "Retry 3D"}
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
