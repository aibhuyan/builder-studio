import { Character } from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function getCharacters(): Promise<Character[]> {
  const res = await fetch(`${BASE_URL}/characters/`)
  if (!res.ok) throw new Error("Failed to fetch characters")
  return res.json()
}

export async function getCharacter(id: number): Promise<Character> {
  const res = await fetch(`${BASE_URL}/characters/${id}`)
  if (!res.ok) throw new Error("Failed to fetch character")
  return res.json()
}

export async function getGlbStatus(id: number) {
  const res = await fetch(`${BASE_URL}/characters/${id}/glb-status`)
  if (!res.ok) throw new Error("Failed to fetch GLB status")
  return res.json()
}

export async function getAdminQueue(): Promise<Character[]> {
  const res = await fetch(`${BASE_URL}/admin/queue`)
  if (!res.ok) throw new Error("Failed to fetch admin queue")
  return res.json()
}

export async function getAllCharacters(): Promise<Character[]> {
  const res = await fetch(`${BASE_URL}/admin/all`)
  if (!res.ok) throw new Error("Failed to fetch all characters")
  return res.json()
}

export async function decideCharacter(
  id: number,
  decision: "approved" | "rejected",
  note?: string
): Promise<Character> {
  const res = await fetch(`${BASE_URL}/admin/${id}/decide`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, note }),
  })
  if (!res.ok) throw new Error("Failed to submit decision")
  return res.json()
}


export interface VoteResult {
  id: number
  upvotes: number
  downvotes: number
}

export async function voteCharacter(
  id: number,
  direction: "up" | "down",
  action: "cast" | "remove"
): Promise<VoteResult> {
  const res = await fetch(`${BASE_URL}/characters/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direction, action }),
  })
  if (!res.ok) throw new Error("Failed to submit vote")
  return res.json()
}

export async function retryMesh(id: number): Promise<Character> {
  const res = await fetch(`${BASE_URL}/admin/${id}/retry-mesh`, { method: "POST" })
  if (!res.ok) throw new Error("Failed to retry mesh generation")
  return res.json()
}

export const API_BASE = BASE_URL
