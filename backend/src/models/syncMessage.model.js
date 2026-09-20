import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| Conversation Sync State Schema
| Stores ONLY the single latest conversation state and updationId per pair
| No per-message records are created on the server!
|--------------------------------------------------------------------------
*/
const conversationSyncSchema = new mongoose.Schema(
  {
    pairKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userA: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userB: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    updationId: {
      type: Number,
      default: 0,
      index: true,
    },
    chatPayload: {
      type: String,
      default: "[]",
    },
    lastSender: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to build a deterministic pairKey (alphabetical order)
conversationSyncSchema.statics.getPairKey = function (u1, u2) {
  const sorted = [u1.toLowerCase().trim(), u2.toLowerCase().trim()].sort();
  return `${sorted[0]}__${sorted[1]}`;
};

const conversationSyncModel = mongoose.model("ConversationSync", conversationSyncSchema);

export default conversationSyncModel;
