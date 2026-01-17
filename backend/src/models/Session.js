import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    // Problem Details
    problem: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      lowercase: true,
    },

    // Session Participants
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Session Status
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
      index: true,
    },

    // Stream Integration
    callId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Session Metadata
    metadata: {
      totalDuration: {
        type: Number,
        default: 0, // in seconds
      },
      messagesCount: {
        type: Number,
        default: 0,
      },
      codeSubmitted: {
        type: Boolean,
        default: false,
      },
      participantJoinedAt: {
        type: Date,
        default: null,
      },
      completedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for checking if session has both participants
sessionSchema.virtual("isFull").get(function() {
  return !!this.participant;
});

// Virtual for session duration
sessionSchema.virtual("duration").get(function() {
  if (!this.metadata?.completedAt) return null;
  return Math.floor((this.metadata.completedAt - this.createdAt) / 1000); // in seconds
});

// Index for efficient queries
sessionSchema.index({ createdAt: -1 });
sessionSchema.index({ host: 1, status: 1 });
sessionSchema.index({ participant: 1, status: 1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
