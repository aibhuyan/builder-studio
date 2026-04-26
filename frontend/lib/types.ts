export interface Character {
  id: number
  pitch: string
  name: string | null
  emoji: string | null
  type: string | null
  rarity: string | null
  archetype: string | null
  hp: number | null
  attack: number | null
  defense: number | null
  speed: number | null
  special: number | null
  abilities: string[] | null
  weaknesses: string[] | null
  lore: string | null
  backstory: string | null
  portrait_url: string | null
  glb_url: string | null
  glb_status: string
  glb_task_id: string | null
  glb_error: string | null
  status: string
  ai_score: number | null
  ai_recommendation: string | null
  ai_checks: Record<string, { passed: boolean; note: string }> | null
  ai_reasoning: string | null
  human_decision: string | null
  human_note: string | null
  created_by: string | null
  upvotes: number
  downvotes: number
  agent_transcript: AgentStep[] | null
  balance_transcript: AgentStep[] | null
  screening_transcript: AgentStep[] | null
  created_at: string | null
}

export interface AgentStep {
  type: string
  step: string
  detail?: string
}

export interface SSEStageEvent {
  stage: string
  message: string
}

export interface SSEStepEvent {
  agent: string
  step: string
  detail: string
}

export interface SSEPortraitEvent {
  url: string
}

export interface SSEDoneEvent {
  character_id: number
}

export interface SSEErrorEvent {
  message: string
}

export type RarityColor = {
  [key: string]: string
}

export const RARITY_COLORS: RarityColor = {
  legendary: "text-yellow-400 border-yellow-400",
  epic: "text-purple-400 border-purple-400",
  rare: "text-blue-400 border-blue-400",
  common: "text-gray-400 border-gray-400",
}

export const TYPE_ICONS: Record<string, string> = {
  warrior: "⚔️",
  mage: "🔮",
  tank: "🛡️",
  assassin: "🗡️",
  support: "💚",
  ranger: "🏹",
}
