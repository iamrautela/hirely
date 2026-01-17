import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const auth = req.auth();
      const clerkId = auth.userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // find user in db by clerk ID
      let user = await User.findOne({ clerkId });

      // If user doesn't exist, create them (auto-signup)
      if (!user) {
        const email = auth.sessionClaims?.email || `user_${clerkId}@hirely.local`;
        const name = auth.sessionClaims?.name || "Anonymous";
        const profileImage = auth.sessionClaims?.picture || "";

        user = await User.create({
          clerkId,
          email,
          name,
          profileImage,
        });

        console.log(`Auto-created user in DB for clerkId: ${clerkId}`);
      }

      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
