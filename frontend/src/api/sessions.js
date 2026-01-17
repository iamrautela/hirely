import axiosInstance from "../lib/axios";

/**
 * Session API
 * Centralized API calls for session management
 */

export const sessionApi = {
  /**
   * Create a new interview session
   * @param {Object} data - { problem: string, difficulty: string }
   * @returns {Promise<Object>}
   */
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  /**
   * Get all active sessions
   * @returns {Promise<Object>}
   */
  getActiveSessions: async () => {
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },

  /**
   * Get user's recent completed sessions
   * @returns {Promise<Object>}
   */
  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  /**
   * Get a specific session by ID
   * @param {string} id - Session ID
   * @returns {Promise<Object>}
   */
  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/sessions/${id}`);
    return response.data;
  },

  /**
   * Join an existing session
   * @param {string} id - Session ID
   * @returns {Promise<Object>}
   */
  joinSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/join`);
    return response.data;
  },

  /**
   * End a session (host only)
   * @param {string} id - Session ID
   * @returns {Promise<Object>}
   */
  endSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/end`);
    return response.data;
  },

  /**
   * Get Stream token for video/chat authentication
   * @returns {Promise<Object>}
   */
  getStreamToken: async () => {
    const response = await axiosInstance.get(`/chat/token`);
    return response.data;
  },
};

