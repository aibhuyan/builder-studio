"use client"

import { useAuth, UserRole } from "@/hooks/use-auth"

const PLAYERS: { id: UserRole; emoji: string; label: string; desc: string; style: string }[] = [
  { id: "Player-1", emoji: "🎮", label: "Player 1", desc: "Create & vote on troops",    style: "border-purple-600 hover:border-purple-400 hover:bg-purple-500/10" },
  { id: "Player-2", emoji: "🎮", label: "Player 2", desc: "Create & vote on troops",    style: "border-blue-600   hover:border-blue-400   hover:bg-blue-500/10" },
  { id: "Player-3", emoji: "🎮", label: "Player 3", desc: "Create & vote on troops",    style: "border-green-600  hover:border-green-400  hover:bg-green-500/10" },
  { id: "Admin",    emoji: "🔑", label: "Admin",    desc: "Review & approve troops",    style: "border-amber-500  hover:border-amber-400  hover:bg-amber-500/10" },
]

export default function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto">
            <div className="w-8 h-8 rounded-lg bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-amber-400">BUILDER STUDIO</h1>
          <p className="text-stone-400 text-sm">AI-powered troop creation · Who are you?</p>
        </div>

        {/* Persona cards */}
        <div className="grid grid-cols-2 gap-3">
          {PLAYERS.map((p) => (
            <button
              key={p.id}
              onClick={() => login(p.id)}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 text-center transition-all duration-200 ${p.style}`}
            >
              <span className="text-4xl">{p.emoji}</span>
              <div>
                <div className="font-black text-white text-sm">{p.label}</div>
                <div className="text-xs text-stone-500 mt-0.5">{p.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-stone-700">
          No password required · Your session is saved locally
        </p>
      </div>
    </div>
  )
}
