"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff, User } from "lucide-react"
import type { User as UserType } from "@/lib/types"

interface VideoPanelProps {
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  currentUser: UserType
  participants: UserType[]
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  onToggleVideo: () => void
  onToggleAudio: () => void
}

export function VideoPanel({
  localStream,
  remoteStreams,
  currentUser,
  participants,
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
}: VideoPanelProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  const remoteParticipants = participants.filter((p) => p.id !== currentUser.id)

  return (
    <div className="space-y-3">
      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Local Video */}
        <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
          {isVideoEnabled && localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-foreground"
                style={{ backgroundColor: currentUser.color }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <div className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-xs text-foreground">
            You
          </div>
          {!isAudioEnabled && (
            <div className="absolute right-1 top-1 rounded bg-destructive/80 p-1">
              <MicOff className="h-3 w-3 text-destructive-foreground" />
            </div>
          )}
        </div>

        {/* Remote Videos */}
        {remoteParticipants.map((participant) => {
          const stream = remoteStreams.get(participant.id)
          return (
            <RemoteVideo
              key={participant.id}
              participant={participant}
              stream={stream}
            />
          )
        })}

        {/* Empty slots */}
        {remoteParticipants.length === 0 && (
          <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border bg-secondary/50">
            <div className="text-center">
              <User className="mx-auto h-6 w-6 text-muted-foreground" />
              <span className="mt-1 block text-xs text-muted-foreground">Waiting...</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <Button
          variant={isVideoEnabled ? "secondary" : "destructive"}
          size="sm"
          className="h-9 w-9 p-0"
          onClick={onToggleVideo}
        >
          {isVideoEnabled ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant={isAudioEnabled ? "secondary" : "destructive"}
          size="sm"
          className="h-9 w-9 p-0"
          onClick={onToggleAudio}
        >
          {isAudioEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

function RemoteVideo({
  participant,
  stream,
}: {
  participant: UserType
  stream?: MediaStream
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-foreground"
            style={{ backgroundColor: participant.color }}
          >
            {participant.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-xs text-foreground">
        {participant.name}
      </div>
    </div>
  )
}
