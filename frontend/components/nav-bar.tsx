"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

const STORAGE_KEY = "builder_studio_user"
// Pages that are public (no auth required)
const PUBLIC_PATHS = ["/", "/login"]

export function NavBar() {
  const [user, setUser] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    setUser(stored)

    // Only redirect to login for protected pages
    if (!stored && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login")
    }
  }, [pathname, router])

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    router.replace("/")
  }

  // Don't render nav on standalone login page
  if (pathname === "/login") return null
  if (!mounted) return null

  const isAdmin = user === "Admin"

  return (
    <header className="px-8 py-5 flex items-center justify-between border-b border-amber-900/40 backdrop-blur-xl bg-stone-950/80 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
          <div className="w-4 h-4 rounded bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse" />
        </div>
        <Link href="/" className="text-lg font-black tracking-tight text-amber-400">
          BUILDER STUDIO
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Not logged in — show Login button only */}
        {!user && (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-black px-5 py-2 rounded-lg transition-colors uppercase tracking-wide"
          >
            Login
          </Link>
        )}

        {/* Logged in as Admin */}
        {user && isAdmin && (
          <Link 
            href="/admin" 
            className={`text-sm transition-colors ${pathname === "/admin" ? "text-amber-400 font-bold" : "text-stone-400 hover:text-amber-400"}`}
          >
            Admin Panel
          </Link>
        )}

        {/* Logged in as Player */}
        {user && !isAdmin && (
          <>
            <Link 
              href="/my-creations" 
              className={`text-sm transition-colors ${pathname === "/my-creations" ? "text-amber-400 font-bold" : "text-stone-400 hover:text-amber-400"}`}
            >
              My Troops
            </Link>
            <Link 
              href="/roster" 
              className={`text-sm transition-colors ${pathname === "/roster" ? "text-amber-400 font-bold" : "text-stone-400 hover:text-amber-400"}`}
            >
              Troops Ground
            </Link>
            <Link 
              href="/shadow-barrack" 
              className={`text-sm transition-colors ${pathname === "/shadow-barrack" ? "text-amber-400 font-bold" : "text-stone-400 hover:text-amber-400"}`}
            >
              Shadow Barrack
            </Link>
            <Link 
              href="/create" 
              className={`text-sm transition-colors flex items-center gap-2 ${pathname === "/create" ? "text-amber-400 font-bold" : "text-stone-400 hover:text-amber-400"}`}
            >
              Create <ArrowRight className={`w-3.5 h-3.5 ${pathname === "/create" ? "text-amber-400" : "text-stone-500"}`} />
            </Link>
          </>
        )}

        {/* User badge + logout (when logged in) */}
        {user && (
          <div className="flex items-center gap-2 border border-stone-700 rounded-lg px-3 py-1.5">
            <span className="text-xs text-stone-300 font-semibold">{isAdmin ? "🔑" : "🎮"} {user}</span>
            <button onClick={logout} className="text-xs text-stone-600 hover:text-red-400 transition-colors ml-1" title="Log out">
              ✕
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
