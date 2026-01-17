/**
 * Session Utilities
 * Helper functions for session management on the frontend
 */

/**
 * Check if user is the host of a session
 * @param {Object} session - Session object
 * @param {string} userClerkId - User's Clerk ID
 * @returns {boolean}
 */
export function isSessionHost(session, userClerkId) {
  return session?.host?.clerkId === userClerkId;
}

/**
 * Check if user is a participant in a session
 * @param {Object} session - Session object
 * @param {string} userClerkId - User's Clerk ID
 * @returns {boolean}
 */
export function isSessionParticipant(session, userClerkId) {
  return session?.participant?.clerkId === userClerkId;
}

/**
 * Check if user is involved in a session
 * @param {Object} session - Session object
 * @param {string} userClerkId - User's Clerk ID
 * @returns {boolean}
 */
export function isUserInSession(session, userClerkId) {
  return isSessionHost(session, userClerkId) || isSessionParticipant(session, userClerkId);
}

/**
 * Check if session is full (both participants joined)
 * @param {Object} session - Session object
 * @returns {boolean}
 */
export function isSessionFull(session) {
  return !!session?.participant;
}

/**
 * Check if session is joinable
 * @param {Object} session - Session object
 * @param {string} userClerkId - User's Clerk ID
 * @returns {boolean}
 */
export function isSessionJoinable(session, userClerkId) {
  return (
    session?.status === "active" &&
    !isSessionFull(session) &&
    !isSessionHost(session, userClerkId)
  );
}

/**
 * Format session duration
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatSessionDuration(seconds) {
  if (!seconds) return "0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Get difficulty badge color
 * @param {string} difficulty - Difficulty level
 * @returns {string} Tailwind color class
 */
export function getDifficultyColor(difficulty) {
  const colors = {
    easy: "badge-success",
    medium: "badge-warning",
    hard: "badge-error",
  };
  return colors[difficulty?.toLowerCase()] || "badge-neutral";
}

/**
 * Validate session creation data
 * @param {Object} data - Session data
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateSessionData(data) {
  const errors = [];

  if (!data.problem || typeof data.problem !== "string" || data.problem.trim() === "") {
    errors.push("Problem is required and must be a non-empty string");
  }

  if (!data.difficulty || !["easy", "medium", "hard"].includes(data.difficulty.toLowerCase())) {
    errors.push("Difficulty must be one of: easy, medium, hard");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get session status badge text
 * @param {string} status - Session status
 * @returns {string}
 */
export function getStatusBadgeText(status) {
  const badges = {
    active: "Active",
    completed: "Completed",
  };
  return badges[status] || status;
}

/**
 * Check if session data is loaded
 * @param {Object} session - Session object
 * @returns {boolean}
 */
export function isSessionLoaded(session) {
  return (
    !!session &&
    !!session._id &&
    !!session.problem &&
    !!session.difficulty &&
    !!session.callId
  );
}
