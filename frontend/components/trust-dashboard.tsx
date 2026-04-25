"use client"

import { Character } from "@/lib/types"

interface TrustDashboardProps {
  character: Character
}

export function TrustDashboard({ character }: TrustDashboardProps) {
  const score = character.ai_score ?? 0
  const checks = character.ai_checks ?? {}
  const passedCount = Object.values(checks).filter((c) => c.passed).length
  const totalChecks = Object.keys(checks).length

  const scoreColor =
    score >= 85 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400"

  const recommendationColor = {
    approve: "bg-green-900/50 text-green-400 border-green-800",
    review: "bg-yellow-900/50 text-yellow-400 border-yellow-800",
    reject: "bg-red-900/50 text-red-400 border-red-800",
  }[character.ai_recommendation ?? "review"] ?? "bg-gray-800 text-gray-400 border-gray-700"

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-200">🛡️ Trust Report</h2>

      {/* Score + recommendation */}
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-4xl font-bold ${scoreColor}`}>{score}</div>
          <div className="text-xs text-gray-500 mt-0.5">Safety Score / 100</div>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${recommendationColor} uppercase tracking-wide`}>
          {character.ai_recommendation ?? "pending"}
        </div>
      </div>

      {/* Safety checks */}
      {totalChecks > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Safety Checks ({passedCount}/{totalChecks} passed)
          </div>
          {Object.entries(checks).map(([key, check]) => (
            <div key={key} className="flex items-start gap-3">
              <span className={`mt-0.5 text-sm ${check.passed ? "text-green-400" : "text-red-400"}`}>
                {check.passed ? "✓" : "✗"}
              </span>
              <div>
                <div className="text-xs font-medium text-gray-300">
                  {key.replace(/_/g, " ")}
                </div>
                <div className="text-xs text-gray-500">{check.note}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reasoning */}
      {character.ai_reasoning && (
        <div className="space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider">AI Reasoning</div>
          <p className="text-sm text-gray-400 leading-relaxed">{character.ai_reasoning}</p>
        </div>
      )}
    </div>
  )
}
