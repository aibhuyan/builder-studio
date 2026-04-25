"use client"

import { useEffect, useState } from "react"
import { Character } from "@/lib/types"
import { getAdminQueue, decideCharacter, getAllCharacters } from "@/lib/api"
import { CharacterCard } from "@/components/character-card"
import { TrustDashboard } from "@/components/trust-dashboard"
import { AgentPipeline } from "@/components/agent-pipeline"
import { API_BASE } from "@/lib/api"

export default function AdminPage() {
  const [queue, setQueue] = useState<Character[]>([])
  const [rejected, setRejected] = useState<Character[]>([])
  const [tab, setTab] = useState<"pending" | "rejected">("pending")
  const [selected, setSelected] = useState<Character | null>(null)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [deciding, setDeciding] = useState(false)

  const loadQueue = () => {
    setLoading(true)
    Promise.all([getAdminQueue(), getAllCharacters()])
      .then(([pending, all]) => {
        setQueue(pending)
        setRejected(all.filter((c) => c.status === "rejected"))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadQueue() }, [])

  const handleDecide = async (decision: "approved" | "rejected") => {
    if (!selected) return
    setDeciding(true)
    try {
      await decideCharacter(selected.id, decision, note)
      setSelected(null)
      setNote("")
      loadQueue()
    } finally {
      setDeciding(false)
    }
  }

  if (loading) {
    return <div className="text-gray-500 text-center py-20">Loading queue...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Review</h1>
          <p className="text-gray-400 mt-1">{queue.length} pending · {rejected.length} rejected</p>
        </div>
        <button
          onClick={loadQueue}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-0">
        {(["pending", "rejected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t} ({t === "pending" ? queue.length : rejected.length})
          </button>
        ))}
      </div>

      {tab === "pending" && (
        queue.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <div className="text-5xl mb-4">✅</div>
            <p>Queue is empty. All caught up!</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {queue.map((c) => (
              <CharacterCard
                key={c.id}
                character={c}
                onClick={() => { setSelected(c); setNote("") }}
              />
            ))}
          </div>
        )
      )}

      {tab === "rejected" && (
        rejected.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <div className="text-5xl mb-4">🗑️</div>
            <p>No rejected characters yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rejected.map((c) => (
              <div key={c.id} className="flex items-start gap-4 bg-gray-900 border border-red-900/40 rounded-xl p-4">
                {c.portrait_url && (
                  <img
                    src={c.portrait_url.startsWith("http") ? c.portrait_url : `${API_BASE}${c.portrait_url}`}
                    alt={c.name ?? ""}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span>{c.emoji}</span>
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="text-xs text-gray-500">{c.rarity} {c.type}</span>
                    {c.ai_score != null && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        c.ai_score >= 80 ? "bg-green-900/40 text-green-400 border-green-800"
                        : c.ai_score >= 60 ? "bg-yellow-900/40 text-yellow-400 border-yellow-800"
                        : "bg-red-900/40 text-red-400 border-red-800"
                      }`}>🛡 {c.ai_score}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Pitch: "{c.pitch}"</p>
                  {c.human_note && (
                    <div className="mt-2 flex items-start gap-2">
                      <span className="text-red-400 text-xs mt-0.5">✗</span>
                      <p className="text-sm text-red-300">"{c.human_note}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setSelected(null)}>
          <div
            className="bg-gray-950 border border-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-800 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selected.emoji} {selected.name}</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  {selected.archetype} · {selected.rarity} {selected.type} · Pitch: "{selected.pitch}"
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-white text-xl ml-4">✕</button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
              {/* Left: portrait + stats */}
              <div className="space-y-4">
                {selected.portrait_url && (
                  <img
                    src={selected.portrait_url.startsWith("http") || selected.portrait_url.startsWith("data:") ? selected.portrait_url : `${API_BASE}${selected.portrait_url}`}
                    alt={selected.name ?? "Character"}
                    className="w-full rounded-xl object-cover aspect-square"
                  />
                )}

                <div className="grid grid-cols-5 gap-1 text-center">
                  {[
                    { label: "HP", value: selected.hp },
                    { label: "ATK", value: selected.attack },
                    { label: "DEF", value: selected.defense },
                    { label: "SPD", value: selected.speed },
                    { label: "SPC", value: selected.special },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-800 rounded p-2">
                      <div className="text-xs text-gray-500">{label}</div>
                      <div className="text-sm font-bold">{value}</div>
                    </div>
                  ))}
                </div>

                {selected.abilities && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Abilities</div>
                    <ul className="space-y-1">
                      {selected.abilities.map((a, i) => (
                        <li key={i} className="text-xs text-gray-300 flex gap-2">
                          <span className="text-purple-400">▸</span>{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.lore && (
                  <p className="text-xs text-gray-400 leading-relaxed">{selected.lore}</p>
                )}
              </div>

              {/* Right: trust + transcript */}
              <div className="space-y-4">
                <TrustDashboard character={selected} />

                {selected.agent_transcript && selected.agent_transcript.length > 0 && (
                  <AgentPipeline
                    stage="safety"
                    stageMessage="Generation complete"
                    steps={[
                      ...(selected.agent_transcript ?? []),
                      ...(selected.balance_transcript ?? []),
                      ...(selected.screening_transcript ?? []),
                    ]}
                    isStreaming={false}
                  />
                )}
              </div>
            </div>

            {/* Decision */}
            <div className="p-6 border-t border-gray-800 space-y-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note for this decision..."
                rows={2}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleDecide("approved")}
                  disabled={deciding}
                  className="flex-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleDecide("rejected")}
                  disabled={deciding}
                  className="flex-1 bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition-colors"
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
