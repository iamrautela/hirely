"use client"

import { Crown } from "lucide-react"
import type { User } from "@/lib/types"

interface ParticipantsPanelProps {
  participants: User[]
  currentUserId: string
}

export function ParticipantsPanel({
  participants,
  currentUserId,
}: ParticipantsPanelProps) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">
          In this session ({participants.length})
        </h3>
      </div>

      <div className="space-y-2">
        {participants.map((participant, index) => {
          const isHost = index === 0
          const isYou = participant.id === currentUserId

          return (
            <div
              key={participant.id}
              className="flex items-center gap-3 rounded-lg bg-secondary p-3"
            >
              <div className="relative">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-foreground"
                  style={{ backgroundColor: participant.color }}
                >
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-online" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {participant.name}
                  </span>
                  {isYou && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      (You)
                    </span>
                  )}
                </div>
                {isHost && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Crown className="h-3 w-3 text-chart-3" />
                    <span>Host</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {participants.length === 1 && (
        <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Share the session code to invite others
          </p>
        </div>
      )}
    </div>
  )
}
