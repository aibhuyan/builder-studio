"use client"

import { Character, RARITY_COLORS, TYPE_ICONS } from "@/lib/types"
import { API_BASE } from "@/lib/api"
import Image from "next/image"
import { useVote } from "@/hooks/use-vote"
import { useShadowBarrack } from "@/hooks/use-shadow-barrack"
import { usePathname } from "next/navigation"

interface CharacterCardProps {
  character: Character
  onClick?: () => void
  isWinner?: boolean
}

export function CharacterCard({ character, onClick, isWinner }: CharacterCardProps) {
  const { isPicked, togglePick } = useShadowBarrack()
  const pathname = usePathname()
  const rarityClass = RARITY_COLORS[character.rarity ?? "common"] ?? "text-gray-400 border-gray-400"
  const typeIcon = TYPE_ICONS[character.type ?? "warrior"] ?? "⚔️"
  const { upvotes, downvotes, currentVote, loading, vote } = useVote(
    character.id,
    character.upvotes ?? 0,
    character.downvotes ?? 0
  )
  const netVotes = upvotes - downvotes

  const portraitSrc = character.portrait_url?.startsWith("http")
    ? character.portrait_url
    : character.portrait_url?.startsWith("data:")
    ? character.portrait_url
    : character.portrait_url
    ? `${API_BASE}${character.portrait_url}`
    : null

  const picked = isPicked(character.id)
  const isShadowBarrack = pathname === "/shadow-barrack"

  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 border rounded-xl overflow-hidden transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl ${
        onClick ? "cursor-pointer" : ""
      } ${rarityClass.includes("border") ? rarityClass.split(" ").find(c => c.startsWith("border")) : "border-gray-800"}`}
    >
      {/* Portrait */}
      <div className="aspect-square bg-gray-800 relative">
        {portraitSrc ? (
          <Image
            src={portraitSrc}
            alt={character.name ?? "Character"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {character.emoji ?? "❓"}
          </div>
        )}
        <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-gray-950/80 border ${rarityClass}`}>
          {character.rarity?.toUpperCase()}
        </div>
        {isWinner && (
          <div className="absolute top-2 left-2 text-xl z-10" title="Community Top Pick">👑</div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3 relative">
        <div>
          <div className="flex items-center gap-2">
            <span>{character.emoji}</span>
            <h3 className="font-bold text-white">{character.name}</h3>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {typeIcon} {character.type} · {character.archetype}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-1 text-center">
          {[
            { label: "HP", value: character.hp },
            { label: "ATK", value: character.attack },
            { label: "DEF", value: character.defense },
            { label: "SPD", value: character.speed },
            { label: "SPC", value: character.special },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-800 rounded p-1">
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-sm font-bold text-white">{value ?? "—"}</div>
            </div>
          ))}
        </div>

        {/* Lore */}
        {character.lore && (
          <p className="text-xs text-gray-400 line-clamp-2">{character.lore}</p>
        )}

        {/* Vote bar */}
        <div
          className="flex items-center justify-between pt-2 border-t border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => vote("up")}
              disabled={loading}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors font-semibold border ${
                currentVote === "up"
                  ? "bg-green-700/40 text-green-300 border-green-600"
                  : "bg-gray-800 text-gray-400 border-gray-700 hover:border-green-700 hover:text-green-400"
              }`}
            >
              ▲ {upvotes}
            </button>
            <button
              onClick={() => vote("down")}
              disabled={loading}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors font-semibold border ${
                currentVote === "down"
                  ? "bg-red-700/40 text-red-300 border-red-600"
                  : "bg-gray-800 text-gray-400 border-gray-700 hover:border-red-700 hover:text-red-400"
              }`}
            >
              ▼ {downvotes}
            </button>
          </div>
          <span className={`text-xs font-bold ${
            netVotes > 0 ? "text-green-400" : netVotes < 0 ? "text-red-400" : "text-gray-600"
          }`}>
            {netVotes > 0 ? `+${netVotes}` : netVotes}
          </span>
        </div>

          {/* Trust badge & Pick button */}
          <div className="flex items-center justify-between gap-2">
            {character.ai_score != null && (
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full w-fit border ${
                character.ai_score >= 80
                  ? "bg-green-900/40 text-green-400 border-green-800"
                  : character.ai_score >= 60
                  ? "bg-yellow-900/40 text-yellow-400 border-yellow-800"
                  : "bg-red-900/40 text-red-400 border-red-800"
              }`}>
                🛡 Trust {character.ai_score}
              </div>
            )}
  
            {typeof window !== "undefined" && localStorage.getItem("builder_studio_user") !== "Admin" && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePick(character.id)
                }}
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border ${
                  picked
                    ? isShadowBarrack
                      ? "bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white"
                      : "bg-amber-500/10 border-amber-500 text-amber-400"
                    : "bg-stone-800/40 border-stone-700 text-stone-500 hover:border-amber-500/50 hover:text-amber-400"
                }`}
              >
                {isShadowBarrack ? "Unpick" : picked ? "Picked ✓" : "Pick"}
              </button>
            )}
          </div>
      </div>
    </div>
  )
}
