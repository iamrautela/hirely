/**
 * Video Call Manager Hook
 * Comprehensive hook for managing Stream video call lifecycle
 * Handles call joining, leaving, and state management
 */

import { useState, useEffect, useCallback } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

const useVideoCallManager = (session, loadingSession, isHost, isParticipant) => {
  // State management
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const [error, setError] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);

  /**
   * Initialize video call and chat
   */
  const initializeVideoCall = useCallback(async () => {
    // Guard clauses
    if (!session?.callId) return;
    if (!isHost && !isParticipant) return;
    if (session.status === "completed") return;

    setIsInitializingCall(true);
    setError(null);

    try {
      // Get Stream token from backend
      const { token, userId, userName, userImage } = await sessionApi.getStreamToken();

      // Initialize Stream video client
      const videoClient = await initializeStreamClient(
        {
          id: userId,
          name: userName,
          image: userImage,
        },
        token
      );
      setStreamClient(videoClient);

      // Create or join the call
      const videoCall = videoClient.call("default", session.callId);
      await videoCall.join({ create: true });
      setCall(videoCall);
      setIsCallActive(true);

      // Initialize Stream chat client
      const apiKey = import.meta.env.VITE_STREAM_API_KEY;
      const chatClientInstance = StreamChat.getInstance(apiKey);

      await chatClientInstance.connectUser(
        {
          id: userId,
          name: userName,
          image: userImage,
        },
        token
      );
      setChatClient(chatClientInstance);

      // Join chat channel
      const chatChannel = chatClientInstance.channel("messaging", session.callId);
      await chatChannel.watch();
      setChannel(chatChannel);

      // Success notification
      toast.success("Connected to video call");
    } catch (err) {
      const errorMessage = err?.message || "Failed to initialize video call";
      console.error("Error initializing video call:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsInitializingCall(false);
    }
  }, [session, isHost, isParticipant]);

  /**
   * Leave video call and cleanup
   */
  const leaveVideoCall = useCallback(async () => {
    try {
      if (call) {
        await call.leave();
        setCall(null);
        setIsCallActive(false);
      }

      if (chatClient) {
        await chatClient.disconnectUser();
        setChatClient(null);
        setChannel(null);
      }

      await disconnectStreamClient();
      setStreamClient(null);
    } catch (err) {
      console.error("Error leaving video call:", err);
    }
  }, [call, chatClient]);

  /**
   * Effect: Initialize call when session loads
   */
  useEffect(() => {
    if (session && !loadingSession) {
      initializeVideoCall();
    }

    return () => {
      // Cleanup on unmount
      (async () => {
        await leaveVideoCall();
      })();
    };
  }, [session, loadingSession, initializeVideoCall, leaveVideoCall]);

  /**
   * Handle session completion
   */
  useEffect(() => {
    if (session?.status === "completed") {
      leaveVideoCall();
      setIsCallActive(false);
    }
  }, [session?.status, leaveVideoCall]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
    error,
    isCallActive,
    leaveVideoCall,
  };
};

export default useVideoCallManager;
