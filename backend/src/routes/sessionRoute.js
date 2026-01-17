import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  endSession,
  getActiveSessions_,
  getMyRecentSessions,
  getSessionByIdHandler,
  joinSession,
} from "../controllers/sessionController.js";

const router = express.Router();

// Session creation and management
router.post("/", protectRoute, createSession);

// Fetch sessions
router.get("/active", protectRoute, getActiveSessions_);
router.get("/my-recent", protectRoute, getMyRecentSessions);

// Specific session operations
router.get("/:id", protectRoute, getSessionByIdHandler);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);

export default router;

