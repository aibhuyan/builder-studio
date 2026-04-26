import Link from "next/link"
import { Sparkles, Swords, Bot, ShieldCheck, UserCheck, Box, ArrowRight, Rocket, Warehouse } from "lucide-react"
import { CreateButton } from "@/components/create-button"

const PIPELINE = [
  {
    icon: Sparkles,
    label: "Pitch",
    desc: "Describe your character in one sentence — the AI pipeline does the rest.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  {
    icon: Swords,
    label: "AI Forge",
    desc: "Agents design portraits, stats, and balance the troop against the roster.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  {
    icon: ShieldCheck,
    label: "Safety Screen",
    desc: "AI runs 5 safety checks and produces a trust score with full reasoning.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  {
    icon: UserCheck,
    label: "Human Gate",
    desc: "Directors review the AI reports and authorize the troop for deployment.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  {
    icon: Box,
    label: "3D Mesh Forge",
    desc: "Manually trigger high-fidelity 3D generation to bring your troop to life.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  {
    icon: Warehouse,
    label: "Troops Ground",
    desc: "Join the live roster and pick your favorites for your Shadow Barrack.",
    color: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen w-full -mt-8 -mx-6">

      {/* Hero */}
      <section className="px-8 pt-24 pb-28 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest mb-8">
          <Rocket className="w-3.5 h-3.5" /> Agentic Character Creation
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6">
          Every troop has a creator.
          <br />
          <span className="text-amber-400">Be one.</span>
        </h1>
        <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Pitch a concept. Watch 4 AI agents design, balance, and screen your character in real time.
          Directors approve the best — and they get a 3D model.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <CreateButton label="Create a Character" />

        </div>
      </section>

      {/* Pipeline */}
      <section className="px-8 py-16 border-y border-amber-900/30 bg-stone-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest mb-3">
              The Pipeline
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              How it works
            </h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
            {PIPELINE.map((step, i) => {
              const Icon = step.icon
              return (
                <li key={step.label} className="relative">
                  <div className={`p-5 rounded-2xl border ${step.border} ${step.bg} h-full flex flex-col gap-3 hover:scale-[1.03] transition-transform duration-300`}>
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl ${step.bg} ${step.border} border flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${step.color}`} />
                      </div>
                      <span className="text-xs font-mono font-bold text-stone-600 tracking-widest">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      <div className={`text-sm font-black uppercase tracking-wider ${step.color} mb-1.5`}>
                        {step.label}
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 w-5 h-5 text-stone-700 z-10" />
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Trust section */}
      <section className="px-8 py-20 max-w-4xl mx-auto text-center">
        <div className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest mb-4">
          The Trust
        </div>
        <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-4">
          You always know what the AI is doing — and why.
        </h3>
        <p className="text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Every agent decision is visible in real time. Safety checks are named and explained.
          Confidence scores are explicit. Humans stay in the loop before anything goes live.
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12 text-left">
          {[
            { icon: "🔍", title: "Full Reasoning Trace", desc: "Every agent step is logged and streamed live." },
            { icon: "⚖️", title: "Named Safety Checks", desc: "5 explicit checks with pass/fail and explanation." },
            { icon: "🧑‍⚖️", title: "Human Gate", desc: "No character goes live without director approval." },
          ].map((item) => (
            <div key={item.title} className="bg-stone-900 border border-amber-900/40 rounded-xl p-4">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-bold text-amber-100 mb-1">{item.title}</div>
              <div className="text-xs text-stone-500">{item.desc}</div>
            </div>
          ))}
        </div>

      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-amber-900/30 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono text-stone-600 uppercase tracking-widest">
        <span>Builder Studio · Agentic Character Forge</span>

      </footer>

    </div>
  )
}
