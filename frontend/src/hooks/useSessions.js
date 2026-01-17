import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionApi } from "../api/sessions";
import toast from "react-hot-toast";

export const useSessionById = (sessionId) => {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      try {
        const response = await sessionApi.getSessionById(sessionId);
        return response;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!sessionId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ["activeSessions"],
    queryFn: async () => {
      try {
        const response = await sessionApi.getActiveSessions();
        return response;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 30000,
    refetchInterval: 10000,
  });
};

export const useMyRecentSessions = () => {
  return useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: async () => {
      try {
        const response = await sessionApi.getMyRecentSessions();
        return response;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 30000,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        const response = await sessionApi.createSession(data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Session created successfully!");
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["myRecentSessions"] });
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create session");
    },
  });
};

export const useJoinSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId) => {
      try {
        const response = await sessionApi.joinSession(sessionId);
        return response;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data, sessionId) => {
      toast.success("Joined session successfully!");
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to join session");
    },
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId) => {
      try {
        const response = await sessionApi.endSession(sessionId);
        return response;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data, sessionId) => {
      toast.success("Session ended successfully!");
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["myRecentSessions"] });
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to end session");
    },
  });
};
