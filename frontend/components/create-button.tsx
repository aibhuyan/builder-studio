"use client"

import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"

const STORAGE_KEY = "builder_studio_user"

export function CreateButton({ label = "Create a Character", size = "lg" }: { label?: string; size?: "lg" | "sm" }) {
  const router = useRouter()

  const handleClick = () => {
    const user = localStorage.getItem(STORAGE_KEY)
    router.push(user ? "/create" : "/login")
  }

  const cls = size === "lg"
    ? "flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black uppercase tracking-widest text-sm h-14 px-8 rounded-xl shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-colors"
    : "inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black uppercase tracking-widest text-sm h-14 px-8 rounded-xl shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-colors"

  return (
    <button onClick={handleClick} className={cls}>
      <Sparkles className="w-4 h-4" /> {label}
    </button>
  )
}
