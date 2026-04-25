"use client"

import { useState } from "react"
import { useCharacterStream, TroopFormData } from "@/hooks/use-character-stream"
import { AgentPipeline } from "@/components/agent-pipeline"
import { API_BASE } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"

const ARCHETYPES = [
  { id: "barbarian", label: "Barbarian", emoji: "🪓", desc: "Fast melee attacker", stats: "High ATK · High SPD" },
  { id: "giant",     label: "Giant",     emoji: "🏰", desc: "Slow, unkillable tank", stats: "High HP · High DEF" },
  { id: "archer",    label: "Archer",    emoji: "🏹", desc: "Ranged skirmisher", stats: "High SPD · Mid ATK" },
  { id: "wizard",    label: "Wizard",    emoji: "🔮", desc: "Powerful spell caster", stats: "High SPC · Mid ATK" },
  { id: "balloon",   label: "Balloon",   emoji: "🎈", desc: "Air support unit", stats: "Balanced · High SPC" },
]

const TARGETS = [
  { id: "ground",  label: "Ground", emoji: "🌍" },
  { id: "air",     label: "Air",    emoji: "💨" },
  { id: "both",    label: "Both",   emoji: "🎯" },
]

const ABILITIES = [
  { id: "splash",  label: "Splash Damage",  emoji: "💥", desc: "Hits all nearby enemies" },
  { id: "rage",    label: "Rage Boost",     emoji: "😡", desc: "Temporarily boosts ATK & SPD" },
  { id: "freeze",  label: "Freeze Attack",  emoji: "❄️",  desc: "Slows enemy movement" },
  { id: "chain",   label: "Chain Attack",   emoji: "⚡", desc: "Bounces between targets" },
  { id: "heal",    label: "Heal Nearby",    emoji: "💚", desc: "Restores nearby troop HP" },
]

const WEAKNESSES = [
  { id: "low_hp",        label: "Low HP",           emoji: "💔", desc: "Fragile — dies quickly" },
  { id: "slow",          label: "Slow Movement",    emoji: "🐢", desc: "Hard to position" },
  { id: "high_housing",  label: "High Housing Space", emoji: "🏠", desc: "Takes up lots of space" },
  { id: "single_target", label: "Single Target Only", emoji: "🎪", desc: "Can't hit multiple enemies" },
  { id: "expensive",     label: "High Elixir Cost",  emoji: "💜", desc: "Expensive to deploy" },
]

export default function CreatePage() {
  const [troopName, setTroopName] = useState("")
  const [archetype, setArchetype] = useState("")
  const [target, setTarget] = useState("")
  const [ability, setAbility] = useState("")
  const [weakness, setWeakness] = useState("")
  const [creativePrompt, setCreativePrompt] = useState("")

  const { state, generate, reset } = useCharacterStream()

  const isReady = troopName.trim() && archetype && target && ability && weakness
  const isStreaming = state.status === "streaming"
  const isDone = state.status === "done"
  const isError = state.status === "error"

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!isReady || isStreaming) return
    const formData: TroopFormData = {
      troop_name: troopName.trim(),
      archetype_template: archetype,
      target_preference: target,
      special_ability: ability,
      weakness,
      creative_prompt: creativePrompt.trim() || undefined,
    }
    generate(formData)
  }

  const handleReset = () => {
    reset()
    setTroopName("")
    setArchetype("")
    setTarget("")
    setAbility("")
    setWeakness("")
    setCreativePrompt("")
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Troop Builder</h1>
        <p className="text-stone-400 mt-1">
          Design your troop. Stats are balanced automatically — your choices shape the outcome.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* LEFT — Builder form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Troop Name */}
          <div>
            <label className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-2 block">
              Troop Name
            </label>
            <input
              type="text"
              value={troopName}
              onChange={(e) => setTroopName(e.target.value)}
              placeholder="e.g. Inferno Valkyrie"
              disabled={isStreaming}
              maxLength={40}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
          </div>

          {/* Base Archetype */}
          <div>
            <label className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-2 block">
              Base Archetype
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ARCHETYPES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => setArchetype(a.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${
                    archetype === a.id
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-stone-700 bg-stone-900 text-stone-400 hover:border-stone-500"
                  }`}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-xs font-semibold">{a.label}</span>
                  <span className="text-[10px] text-stone-500 leading-tight">{a.stats}</span>
                </button>
              ))}
            </div>
            {archetype && (
              <p className="text-xs text-stone-500 mt-1.5">
                {ARCHETYPES.find(a => a.id === archetype)?.desc}
              </p>
            )}
          </div>

          {/* Target Preference */}
          <div>
            <label className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-2 block">
              Target Preference
            </label>
            <div className="flex gap-2">
              {TARGETS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => setTarget(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                    target === t.id
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-stone-700 bg-stone-900 text-stone-400 hover:border-stone-500"
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Special Ability */}
          <div>
            <label className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-2 block">
              Special Ability <span className="text-stone-600 normal-case">(pick 1)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ABILITIES.map((ab) => (
                <button
                  key={ab.id}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => setAbility(ab.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all text-left ${
                    ability === ab.id
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-stone-700 bg-stone-900 text-stone-400 hover:border-stone-500"
                  }`}
                >
                  <span>{ab.emoji}</span>
                  <div>
                    <div className="font-semibold text-xs">{ab.label}</div>
                    <div className="text-[10px] text-stone-500">{ab.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Weakness */}
          <div>
            <label className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-2 block">
              Weakness Trade-off <span className="text-stone-600 normal-case">(keeps it balanced)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WEAKNESSES.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => setWeakness(w.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all text-left ${
                    weakness === w.id
                      ? "border-red-500 bg-red-500/10 text-red-400"
                      : "border-stone-700 bg-stone-900 text-stone-400 hover:border-stone-500"
                  }`}
                >
                  <span>{w.emoji}</span>
                  <div>
                    <div className="font-semibold text-xs">{w.label}</div>
                    <div className="text-[10px] text-stone-500">{w.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Creative Prompt */}
          <div>
            <label className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-2 block">
              Creative Vision <span className="text-stone-600 normal-case">(optional — shapes appearance & lore only)</span>
            </label>
            <textarea
              value={creativePrompt}
              onChange={(e) => setCreativePrompt(e.target.value)}
              placeholder="e.g. A fire-infused warrior that spins like a Valkyrie and leaves burning ground"
              disabled={isStreaming}
              rows={2}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 disabled:opacity-50 resize-none text-sm"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!isReady || isStreaming}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 py-3 rounded-lg font-black uppercase tracking-wide transition-colors"
            >
              {isStreaming ? "Generating..." : "Generate Troop"}
            </button>
            {(isDone || isError) && (
              <button
                type="button"
                onClick={handleReset}
                className="border border-stone-700 hover:border-stone-500 text-stone-300 px-4 py-3 rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* RIGHT — Output */}
        <div className="space-y-4">
          {/* Portrait */}
          <div className="aspect-square bg-stone-900 border border-stone-800 rounded-xl overflow-hidden flex items-center justify-center relative">
            {state.portraitUrl ? (
              <Image
                src={
                  state.portraitUrl.startsWith("http") || state.portraitUrl.startsWith("data:")
                    ? state.portraitUrl
                    : `${API_BASE}${state.portraitUrl}`
                }
                alt="Troop portrait"
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-center text-stone-600">
                <div className="text-5xl mb-3">🎨</div>
                <p className="text-sm">Portrait appears here</p>
              </div>
            )}
          </div>

          {/* Status */}
          {isDone && state.characterId && (
            <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 text-center space-y-2">
              <div className="text-green-400 font-semibold">✓ Troop Created!</div>
              <p className="text-sm text-stone-400">Pending admin approval before joining the roster.</p>
              <Link href="/admin" className="inline-block mt-1 text-sm text-amber-400 hover:text-amber-300 underline">
                Review in Admin →
              </Link>
            </div>
          )}

          {isError && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
              <div className="text-red-400 font-semibold">Error</div>
              <p className="text-sm text-stone-400 mt-1">{state.error}</p>
            </div>
          )}

          {/* Agent pipeline */}
          {(isStreaming || isDone || state.steps.length > 0) && (
            <AgentPipeline
              stage={state.stage}
              stageMessage={state.stageMessage}
              steps={state.steps}
              isStreaming={isStreaming}
            />
          )}

          {state.status === "idle" && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 text-center text-stone-600">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-sm">Agent pipeline runs here</p>
              <div className="mt-4 space-y-2 text-left text-xs text-stone-700">
                <div>① Portrait Agent — generates troop artwork</div>
                <div>② Character Agent — applies stat constraints & lore</div>
                <div>③ Balance Agent — validates against roster</div>
                <div>④ Safety Agent — screens content</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
