"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export function useMediaStream() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      streamRef.current = stream
      setLocalStream(stream)
      setError(null)
      return stream
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to access camera/microphone"
      setError(message)
      // Create a silent audio track as fallback
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = audioStream
        setLocalStream(audioStream)
        setIsVideoEnabled(false)
      } catch {
        // No media access at all
        setLocalStream(null)
        setIsVideoEnabled(false)
        setIsAudioEnabled(false)
      }
      return null
    }
  }, [])

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }, [])

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }, [])

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setLocalStream(null)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopMedia()
    }
  }, [stopMedia])

  return {
    localStream,
    isVideoEnabled,
    isAudioEnabled,
    error,
    initializeMedia,
    toggleVideo,
    toggleAudio,
    stopMedia,
  }
}
