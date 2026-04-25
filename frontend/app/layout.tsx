import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Studio Wars",
  description: "AI-powered character creation for Studio Wars",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-stone-950 text-white min-h-screen`}>
        <header className="px-8 py-5 flex items-center justify-between border-b border-amber-900/40 backdrop-blur-xl bg-stone-950/80 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <div className="w-4 h-4 rounded bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse" />
            </div>
            <Link href="/" className="text-lg font-black tracking-tight text-amber-400">
              STUDIO WARS
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/roster" className="text-sm text-stone-400 hover:text-amber-400 transition-colors">
              Roster
            </Link>
            <Link href="/admin" className="text-sm text-stone-400 hover:text-amber-400 transition-colors">
              Admin
            </Link>
            <Link
              href="/create"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-black px-4 py-2 rounded-lg transition-colors uppercase tracking-wide"
            >
              Create <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
