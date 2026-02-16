"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import type { User, Message } from "@/lib/types"

interface UseSessionSyncProps {
  sessionId: string
  currentUser: User
  onCodeUpdate: (code: string) => void
  onLanguageUpdate: (language: string) => void
  onParticipantJoin: (user: User) => void
  onParticipantLeave: (userId: string) => void
  onMessageReceive: (message: Message) => void
  onRemoteStream: (userId: string, stream: MediaStream) => void
  onInitialState: (code: string, language: string, participants: User[]) => void
}

interface EventData {
  type: string
  userId: string
  userName?: string
  userColor?: string
  code?: string
  language?: string
  message?: Message
  offer?: RTCSessionDescriptionInit
  answer?: RTCSessionDescriptionInit
  candidate?: RTCIceCandidateInit
  targetUserId?: string
}

export function useSessionSync({
  sessionId,
  currentUser,
  onCodeUpdate,
  onLanguageUpdate,
  onParticipantJoin,
  onParticipantLeave,
  onMessageReceive,
  onRemoteStream,
  onInitialState,
}: UseSessionSyncProps) {
  const [isConnected, setIsConnected] = useState(false)
  const lastEventIdRef = useRef<string>("0")
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())
  const joinedRef = useRef(false)

  // Create peer connection for a remote user
  const createPeerConnection = useCallback(
    (remoteUserId: string) => {
      if (peerConnectionsRef.current.has(remoteUserId)) {
        return peerConnectionsRef.current.get(remoteUserId)!
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      })

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          fetch("/api/ws", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "ice-candidate",
              sessionId,
              userId: currentUser.id,
              targetUserId: remoteUserId,
              candidate: event.candidate.toJSON(),
            }),
          })
        }
      }

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          onRemoteStream(remoteUserId, event.streams[0])
        }
      }

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          if (localStreamRef.current) {
            pc.addTrack(track, localStreamRef.current)
          }
        })
      }

      peerConnectionsRef.current.set(remoteUserId, pc)
      return pc
    },
    [sessionId, currentUser.id, onRemoteStream]
  )

  // Handle incoming WebRTC signaling
  const handleSignaling = useCallback(
    async (data: EventData) => {
      const { type, userId: remoteUserId, offer, answer, candidate } = data

      if (remoteUserId === currentUser.id) return

      let pc = peerConnectionsRef.current.get(remoteUserId)

      try {
        if (type === "offer" && offer) {
          pc = createPeerConnection(remoteUserId)
          await pc.setRemoteDescription(new RTCSessionDescription(offer))

          // Process pending candidates
          const pending = pendingCandidatesRef.current.get(remoteUserId) || []
          for (const c of pending) {
            await pc.addIceCandidate(new RTCIceCandidate(c))
          }
          pendingCandidatesRef.current.delete(remoteUserId)

          const answerDesc = await pc.createAnswer()
          await pc.setLocalDescription(answerDesc)

          await fetch("/api/ws", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "answer",
              sessionId,
              userId: currentUser.id,
              targetUserId: remoteUserId,
              answer: answerDesc,
            }),
          })
        } else if (type === "answer" && answer && pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))

          // Process pending candidates
          const pending = pendingCandidatesRef.current.get(remoteUserId) || []
          for (const c of pending) {
            await pc.addIceCandidate(new RTCIceCandidate(c))
          }
          pendingCandidatesRef.current.delete(remoteUserId)
        } else if (type === "ice-candidate" && candidate) {
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } else {
            // Queue candidate for later
            const pending = pendingCandidatesRef.current.get(remoteUserId) || []
            pending.push(candidate)
            pendingCandidatesRef.current.set(remoteUserId, pending)
          }
        }
      } catch (err) {
        console.error("WebRTC signaling error:", err)
      }
    },
    [currentUser.id, sessionId, createPeerConnection]
  )

  // Join session
  const joinSession = useCallback(async () => {
    if (joinedRef.current) return
    // Don't join until we have a real user id
    if (!currentUser.id) return

    try {
      const response = await fetch("/api/ws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "join",
          sessionId,
          userId: currentUser.id,
          userName: currentUser.name,
          userColor: currentUser.color,
        }),
      })

      const data = await response.json()
      joinedRef.current = true
      setIsConnected(true)

      if (data.state) {
        onInitialState(
          data.state.code,
          data.state.language,
          data.participants || []
        )
      }

      // Initiate WebRTC connections with existing participants
      if (data.participants) {
        for (const p of data.participants) {
          if (p.id !== currentUser.id) {
            const pc = createPeerConnection(p.id)
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            await fetch("/api/ws", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "offer",
                sessionId,
                userId: currentUser.id,
                targetUserId: p.id,
                offer,
              }),
            })
          }
        }
      }
    } catch (err) {
      console.error("Failed to join session:", err)
      setIsConnected(false)
    }
  }, [sessionId, currentUser, onInitialState, createPeerConnection])

  // Poll for updates
  const pollUpdates = useCallback(async () => {
    if (!joinedRef.current) return

    try {
      const response = await fetch(
        `/api/ws?sessionId=${sessionId}&userId=${currentUser.id}&lastEventId=${lastEventIdRef.current}`
      )
      const data = await response.json()

      if (data.events && data.events.length > 0) {
        for (const event of data.events) {
          const eventData = event.data as EventData
          lastEventIdRef.current = event.id

          switch (eventData.type) {
            case "code-update":
              if (eventData.userId !== currentUser.id && eventData.code !== undefined) {
                onCodeUpdate(eventData.code)
              }
              break

            case "language-update":
              if (eventData.userId !== currentUser.id && eventData.language) {
                onLanguageUpdate(eventData.language)
              }
              break

            case "user-joined":
              if (eventData.userId !== currentUser.id) {
                onParticipantJoin({
                  id: eventData.userId,
                  name: eventData.userName || "Anonymous",
                  color: eventData.userColor || "#888888",
                })

                // Initiate WebRTC connection with new participant
                const pc = createPeerConnection(eventData.userId)
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)

                await fetch("/api/ws", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type: "offer",
                    sessionId,
                    userId: currentUser.id,
                    targetUserId: eventData.userId,
                    offer,
                  }),
                })
              }
              break

            case "user-left":
              if (eventData.userId !== currentUser.id) {
                onParticipantLeave(eventData.userId)
                const pc = peerConnectionsRef.current.get(eventData.userId)
                if (pc) {
                  pc.close()
                  peerConnectionsRef.current.delete(eventData.userId)
                }
              }
              break

            case "chat-message":
              if (eventData.message) {
                onMessageReceive(eventData.message)
              }
              break

            case "offer":
            case "answer":
            case "ice-candidate":
              if (eventData.targetUserId === currentUser.id) {
                await handleSignaling(eventData)
              }
              break
          }
        }
      }
    } catch (err) {
      console.error("Polling error:", err)
    }
  }, [
    sessionId,
    currentUser.id,
    onCodeUpdate,
    onLanguageUpdate,
    onParticipantJoin,
    onParticipantLeave,
    onMessageReceive,
    createPeerConnection,
    handleSignaling,
  ])

  // Initialize connection
  useEffect(() => {
    joinSession()

    // Start polling
    pollingRef.current = setInterval(pollUpdates, 500)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
      // Leave session
      if (joinedRef.current) {
        fetch("/api/ws", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "leave",
            sessionId,
            userId: currentUser.id,
          }),
        })
      }
      // Cleanup peer connections
      peerConnectionsRef.current.forEach((pc) => pc.close())
      peerConnectionsRef.current.clear()
    }
  }, [joinSession, pollUpdates, sessionId, currentUser.id])

  // Send code update
  const sendCodeUpdate = useCallback(
    (code: string) => {
      fetch("/api/ws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "code-update",
          sessionId,
          userId: currentUser.id,
          code,
        }),
      })
    },
    [sessionId, currentUser.id]
  )

  // Send language update
  const sendLanguageUpdate = useCallback(
    (language: string) => {
      fetch("/api/ws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "language-update",
          sessionId,
          userId: currentUser.id,
          language,
        }),
      })
    },
    [sessionId, currentUser.id]
  )

  // Send chat message
  const sendMessage = useCallback(
    (message: Message) => {
      fetch("/api/ws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat-message",
          sessionId,
          userId: currentUser.id,
          message,
        }),
      })
    },
    [sessionId, currentUser.id]
  )

  // Set local stream for WebRTC
  const setLocalStream = useCallback((stream: MediaStream | null) => {
    localStreamRef.current = stream
  }, [])

  // Leave session
  const leaveSession = useCallback(() => {
    if (joinedRef.current) {
      fetch("/api/ws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "leave",
          sessionId,
          userId: currentUser.id,
        }),
      })
      joinedRef.current = false
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }
    peerConnectionsRef.current.forEach((pc) => pc.close())
    peerConnectionsRef.current.clear()
    setIsConnected(false)
  }, [sessionId, currentUser.id])

  return {
    isConnected,
    sendCodeUpdate,
    sendLanguageUpdate,
    sendMessage,
    setLocalStream,
    leaveSession,
  }
}
