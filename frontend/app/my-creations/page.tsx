"use client"

import { useEffect, useState } from "react"
import { Character } from "@/lib/types"
import { getMyCreations } from "@/lib/api"
import { API_BASE } from "@/lib/api"
import Link from "next/link"

const STORAGE_KEY = "builder_studio_user"

const STATUS_BADGE: Record<string, { label: string; style: string }> = {
  pending_approval: { label: "Awaiting Review",  style: "bg-amber-900/40 text-amber-400 border-amber-700" },
  approved:         { label: "Live ✓",           style: "bg-green-900/40 text-green-400 border-green-700" },
  rejected:         { label: "Rejected ✗",       style: "bg-red-900/40 text-red-400 border-red-700" },
  draft:            { label: "Draft",             style: "bg-stone-800 text-stone-400 border-stone-700" },
  failed:           { label: "Failed",            style: "bg-red-900/40 text-red-400 border-red-700" },
}

export default function MyCreationsPage() {
  const [troops, setTroops] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setUser(stored)
    if (!stored) return
    getMyCreations(stored)
      .then(setTroops)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-stone-500 text-center py-20">Loading your troops...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Troops</h1>
          <p className="text-stone-400 mt-1">{user} · {troops.length} troop{troops.length !== 1 ? "s" : ""} in your barracks</p>
        </div>
        <Link href="/create" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-4 py-2 rounded-lg uppercase tracking-wide text-sm transition-colors">
          + Create New
        </Link>
      </div>

      {troops.length === 0 ? (
        <div className="text-center py-24 text-stone-600">
          <div className="text-6xl mb-4">🪖</div>
          <p className="text-lg font-semibold text-stone-500">No troops yet</p>
          <p className="text-sm mt-2">Build your first troop and it will appear here</p>
          <Link href="/create" className="mt-4 inline-block text-amber-400 hover:text-amber-300 text-sm underline">
            Create your first troop →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {troops.map((c) => {
            const badge = STATUS_BADGE[c.status] ?? { label: c.status, style: "bg-stone-800 text-stone-400 border-stone-700" }
            const portraitSrc = c.portrait_url
              ? c.portrait_url.startsWith("http") ? c.portrait_url : `${API_BASE}${c.portrait_url}`
              : null

            return (
              <div key={c.id} className="flex items-center gap-4 bg-stone-900 border border-stone-800 rounded-xl p-4 hover:border-stone-700 transition-colors">
                {/* Portrait */}
                <div className="w-16 h-16 rounded-xl bg-stone-800 flex-shrink-0 overflow-hidden">
                  {portraitSrc
                    ? <img src={portraitSrc} alt={c.name ?? ""} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">{c.emoji ?? "❓"}</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white">{c.name ?? c.pitch.split("—")[0].trim()}</span>
                    {c.rarity && <span className="text-xs text-stone-500">{c.rarity} {c.type}</span>}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 truncate">{c.pitch}</p>
                  {c.status === "rejected" && c.human_note && (
                    <p className="text-xs text-red-400 mt-1">✗ {c.human_note}</p>
                  )}
                </div>

                {/* Status badge */}
                <div className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${badge.style}`}>
                  {badge.label}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
