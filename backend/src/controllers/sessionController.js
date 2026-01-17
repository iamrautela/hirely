/**
 * Session Controller
 * Handles HTTP requests for interview session management
 * Delegates business logic to sessionService
 */

import {
  createInterviewSession,
  joinInterviewSession,
  endInterviewSession,
  getActiveSessions,
  getUserRecentSessions,
  getSessionById,
} from "../services/sessionService.js";

/**
 * POST /sessions
 * Create a new interview session
 */
export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;
    const userName = req.user.name || "Anonymous";

    const session = await createInterviewSession({
      problem,
      difficulty,
      userId,
      clerkId,
      userName,
    });

    return res.status(201).json({
      success: true,
      data: { session },
      message: "Session created successfully",
    });
  } catch (error) {
    console.error("Error in createSession:", error.message);

    // Handle specific error messages
    if (error.message.includes("required")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create session",
    });
  }
}

/**
 * GET /sessions/active
 * Get all active sessions
 */
export async function getActiveSessions_(_, res) {
  try {
    const sessions = await getActiveSessions(20);

    return res.status(200).json({
      success: true,
      data: { sessions },
      count: sessions.length,
    });
  } catch (error) {
    console.error("Error in getActiveSessions:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active sessions",
    });
  }
}

/**
 * GET /sessions/my-recent
 * Get user's recent completed sessions
 */
export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await getUserRecentSessions(userId, 20);

    return res.status(200).json({
      success: true,
      data: { sessions },
      count: sessions.length,
    });
  } catch (error) {
    console.error("Error in getMyRecentSessions:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent sessions",
    });
  }
}

/**
 * GET /sessions/:id
 * Get a specific session by ID
 */
export async function getSessionByIdHandler(req, res) {
  try {
    const { id } = req.params;

    const session = await getSessionById(id);

    return res.status(200).json({
      success: true,
      data: { session },
    });
  } catch (error) {
    console.error("Error in getSessionById:", error.message);

    if (error.message === "Session not found") {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch session",
    });
  }
}

/**
 * POST /sessions/:id/join
 * Join an existing session
 */
export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await joinInterviewSession(id, userId, clerkId);

    return res.status(200).json({
      success: true,
      data: { session },
      message: "Joined session successfully",
    });
  } catch (error) {
    console.error("Error in joinSession:", error.message);

    const statusCode = error.message === "Session not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /sessions/:id/end
 * End a session (host only)
 */
export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await endInterviewSession(id, userId);

    return res.status(200).json({
      success: true,
      data: { session },
      message: "Session ended successfully",
    });
  } catch (error) {
    console.error("Error in endSession:", error.message);

    if (error.message === "Session not found") {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (error.message.includes("host") || error.message.includes("already completed")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to end session",
    });
  }
}

