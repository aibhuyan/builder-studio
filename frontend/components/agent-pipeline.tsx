"use client"

import { AgentStep } from "@/lib/types"

const STAGE_LABELS: Record<string, string> = {
  portrait: "🎨 Portrait Generation",
  character: "⚔️ Character Design",
  balance: "⚖️ Balance Check",
  safety: "🛡️ Safety Screening",
}

const AGENT_COLORS: Record<string, string> = {
  character_agent: "text-purple-400",
  balance_agent: "text-blue-400",
  safety_agent: "text-green-400",
}

interface AgentPipelineProps {
  stage: string
  stageMessage: string
  steps: AgentStep[]
  isStreaming: boolean
}

export function AgentPipeline({ stage, stageMessage, steps, isStreaming }: AgentPipelineProps) {
  const stages = ["portrait", "character", "balance", "safety"]
  const currentIndex = stages.indexOf(stage)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-200">Agent Pipeline</h2>

      {/* Stage progress */}
      <div className="flex items-center gap-2">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i < currentIndex
                  ? "bg-green-900/50 text-green-400 border border-green-800"
                  : i === currentIndex
                  ? "bg-purple-900/50 text-purple-400 border border-purple-700 animate-pulse"
                  : "bg-gray-800 text-gray-600 border border-gray-700"
              }`}
            >
              {i < currentIndex && "✓ "}
              {STAGE_LABELS[s]}
            </div>
            {i < stages.length - 1 && (
              <div className={`h-px w-4 ${i < currentIndex ? "bg-green-700" : "bg-gray-700"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Current stage message */}
      {stageMessage && (
        <div className="text-sm text-gray-400 flex items-center gap-2">
          {isStreaming && (
            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-ping" />
          )}
          {stageMessage}
        </div>
      )}

      {/* Step log */}
      {steps.length > 0 && (
        <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 text-gray-400">
              <span className="text-gray-600 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span className={AGENT_COLORS[step.step] || "text-gray-300"}>{step.step}</span>
              {step.detail && (
                <span className="text-gray-500 truncate">{step.detail}</span>
              )}
            </div>
          ))}
          {isStreaming && (
            <div className="flex gap-3 text-gray-600">
              <span>▌</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
