"use client"

import { useEffect, useState } from "react"
import { Character } from "@/lib/types"
import { getCharacters, retryMesh } from "@/lib/api"
import { CharacterCard } from "@/components/character-card"
import { TrustDashboard } from "@/components/trust-dashboard"
import { ModelViewer } from "@/components/model-viewer"

export default function RosterPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [selected, setSelected] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  const handleRetryMesh = async (id: number) => {
    setRetrying(true)
    try {
      const updated = await retryMesh(id)
      setSelected(updated)
      setCharacters((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } finally {
      setRetrying(false)
    }
  }

  useEffect(() => {
    getCharacters()
      .then(setCharacters)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-500 text-center py-20">Loading roster...</div>
  }

  const topCharacterId = characters.length > 0 ? characters[0].id : null

  return (
    <div className="space-y-6">
      {/* Community Vote banner */}
      <div className="bg-amber-950/40 border border-amber-700/50 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-amber-400 font-black text-sm uppercase tracking-widest mb-0.5">
            Community Vote
          </div>
          <p className="text-stone-300 text-sm">
            Vote for your favourite character. The top pick joins Studio Wars.
          </p>
        </div>
        {topCharacterId && characters[0].name && (
          <div className="text-right hidden sm:block flex-shrink-0 ml-4">
            <div className="text-xs text-stone-500 uppercase tracking-wide">Current leader</div>
            <div className="text-amber-400 font-bold text-sm mt-0.5">
              👑 {characters[0].emoji} {characters[0].name}
            </div>
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold">Character Roster</h1>
        <p className="text-gray-400 mt-1">{characters.length} approved characters</p>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-5xl mb-4">⚔️</div>
          <p>No characters approved yet.</p>
          <a href="/create" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
            Create the first one →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {characters.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              isWinner={c.id === topCharacterId}
              onClick={() => setSelected(selected?.id === c.id ? null : c)}
            />
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6" onClick={() => setSelected(null)}>
          <div
            className="bg-gray-950 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selected.emoji} {selected.name}</h2>
                <p className="text-gray-400 text-sm">{selected.archetype} · {selected.rarity} {selected.type}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-white text-xl">✕</button>
            </div>

            {(selected.glb_url || selected.glb_status === "generating") && (
              <ModelViewer
                characterId={selected.id}
                initialGlbUrl={selected.glb_url}
                initialGlbStatus={selected.glb_status}
                initialRiggedGlbUrl={selected.rigged_glb_url}
                initialRigStatus={selected.rig_status}
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
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Abilities</div>
                <ul className="space-y-1">
                  {selected.abilities.map((a, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-purple-400">▸</span>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {selected.lore && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Lore</div>
                <p className="text-sm text-gray-300 leading-relaxed">{selected.lore}</p>
              </div>
            )}

            <TrustDashboard character={selected} />
          </div>
        </div>
      )}
    </div>
  )
}
