/**
 * Session Service - Business Logic Layer
 * Handles all session-related operations with proper error handling
 * and separation of concerns
 */

import { chatClient, streamClient, upsertStreamUser } from "../lib/stream.js";
import Session from "../models/Session.js";

/**
 * Generate unique call ID for Stream video
 * @returns {string} Unique call ID
 */
export function generateCallId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Initialize Stream user (ensure user exists in Stream)
 * @param {string} clerkId - Clerk user ID
 * @param {string} userName - User name
 * @returns {Promise<void>}
 */
export async function initializeStreamUser(clerkId, userName) {
  try {
    await upsertStreamUser({
      id: clerkId,
      name: userName,
    });
  } catch (error) {
    console.error("Failed to initialize Stream user:", error.message);
    throw new Error("Failed to initialize video service user");
  }
}

/**
 * Create Stream video call
 * @param {string} callId - Call ID
 * @param {string} clerkId - Creator's Clerk ID
 * @param {Object} customData - Custom data to attach to call
 * @returns {Promise<void>}
 */
export async function createStreamVideoCall(callId, clerkId, customData) {
  try {
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: customData,
      },
    });
  } catch (error) {
    console.error("Failed to create Stream video call:", error.message);
    throw new Error("Failed to create video call");
  }
}

/**
 * Create Stream chat channel
 * @param {string} callId - Call ID (also used as channel ID)
 * @param {string} channelName - Channel name
 * @param {string} clerkId - Creator's Clerk ID
 * @returns {Promise<void>}
 */
export async function createStreamChatChannel(callId, channelName, clerkId) {
  try {
    const channel = chatClient.channel("messaging", callId, {
      name: channelName,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();
  } catch (error) {
    console.error("Failed to create Stream chat channel:", error.message);
    throw new Error("Failed to create chat channel");
  }
}

/**
 * Create a new interview session
 * @param {Object} sessionData - Session data
 * @param {string} sessionData.problem - Problem title
 * @param {string} sessionData.difficulty - Problem difficulty
 * @param {string} sessionData.userId - Host user ID (MongoDB)
 * @param {string} sessionData.clerkId - Host Clerk ID
 * @param {string} sessionData.userName - Host user name
 * @returns {Promise<Object>} Created session object
 */
export async function createInterviewSession({ problem, difficulty, userId, clerkId, userName }) {
  // Validate input
  if (!problem || !difficulty) {
    throw new Error("Problem and difficulty are required");
  }

  const normalizedDifficulty = difficulty.toLowerCase();

  try {
    // Step 1: Initialize Stream user
    await initializeStreamUser(clerkId, userName);

    // Step 2: Generate unique call ID
    const callId = generateCallId();

    // Step 3: Create session in database
    const session = await Session.create({
      problem,
      difficulty: normalizedDifficulty,
      host: userId,
      callId,
    });

    // Step 4: Create Stream video call
    await createStreamVideoCall(callId, clerkId, {
      problem,
      difficulty: normalizedDifficulty,
      sessionId: session._id.toString(),
    });

    // Step 5: Create Stream chat channel
    await createStreamChatChannel(callId, `${problem} Session`, clerkId);

    return session;
  } catch (error) {
    // Cleanup on failure: delete created session if Stream operations fail
    if (error.message !== "Problem and difficulty are required") {
      console.error("Error in createInterviewSession:", error.message);
    }
    throw error;
  }
}

/**
 * Join an existing session
 * @param {string} sessionId - Session ID
 * @param {string} userId - Participant user ID (MongoDB)
 * @param {string} clerkId - Participant Clerk ID
 * @returns {Promise<Object>} Updated session object
 */
export async function joinInterviewSession(sessionId, userId, clerkId) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.status !== "active") {
    throw new Error("Cannot join a completed session");
  }

  if (session.host.toString() === userId.toString()) {
    throw new Error("Host cannot join their own session as participant");
  }

  if (session.participant) {
    throw new Error("Session is full");
  }

  try {
    // Add participant to database
    session.participant = userId;
    await session.save();

    // Add participant to Stream chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    return session;
  } catch (error) {
    console.error("Error in joinInterviewSession:", error.message);
    throw new Error("Failed to join session");
  }
}

/**
 * End an interview session
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID requesting to end (must be host)
 * @returns {Promise<Object>} Updated session object
 */
export async function endInterviewSession(sessionId, userId) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.host.toString() !== userId.toString()) {
    throw new Error("Only the host can end the session");
  }

  if (session.status === "completed") {
    throw new Error("Session is already completed");
  }

  try {
    // Delete Stream resources
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    // Update session status
    session.status = "completed";
    await session.save();

    return session;
  } catch (error) {
    console.error("Error in endInterviewSession:", error.message);
    throw new Error("Failed to end session");
  }
}

/**
 * Get all active sessions with proper population
 * @param {number} limit - Maximum number of sessions to return
 * @returns {Promise<Array>} Array of active sessions
 */
export async function getActiveSessions(limit = 20) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(limit);

    return sessions;
  } catch (error) {
    console.error("Error in getActiveSessions:", error.message);
    throw new Error("Failed to fetch active sessions");
  }
}

/**
 * Get user's recent completed sessions
 * @param {string} userId - User ID (MongoDB)
 * @param {number} limit - Maximum number of sessions to return
 * @returns {Promise<Array>} Array of completed sessions
 */
export async function getUserRecentSessions(userId, limit = 20) {
  try {
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(limit);

    return sessions;
  } catch (error) {
    console.error("Error in getUserRecentSessions:", error.message);
    throw new Error("Failed to fetch recent sessions");
  }
}

/**
 * Get session by ID with proper error handling
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session object
 */
export async function getSessionById(sessionId) {
  try {
    const session = await Session.findById(sessionId)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  } catch (error) {
    console.error("Error in getSessionById:", error.message);
    throw error;
  }
}
