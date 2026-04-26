import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { NavBar } from "@/components/nav-bar"

import { ShadowBarrackProvider } from "@/context/shadow-barrack-context"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Builder Studio",
  description: "AI-powered troop creation for Builder Studio",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-stone-950 text-white min-h-screen`}>
        <ShadowBarrackProvider>
          <NavBar />
          <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
        </ShadowBarrackProvider>
      </body>
    </html>
  )
}
