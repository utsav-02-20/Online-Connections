import conversationSyncModel from "../models/syncMessage.model.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

/*
|--------------------------------------------------------------------------
| Helper: Extract & Verify JWT Token
|--------------------------------------------------------------------------
*/
function getTokenPayload(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token missing");
  }
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, config.JWT_SECRET);
}

/*
|--------------------------------------------------------------------------
| Controller: Sync Conversation State via Updation ID
| Endpoint: POST /api/auth/messages/sync
| Compares client updationId vs server updationId.
| If client is lagged or server is lagged, updates both to the latest state.
|--------------------------------------------------------------------------
*/
export async function sync_messages(req, res) {
  try {
    const payload = getTokenPayload(req);
    const authUser = await userModel.findById(payload.id);

    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUsername = authUser.username.toLowerCase();
    const { peerUsername, clientUpdationId = 0, localChatPayload } = req.body;

    if (!peerUsername) {
      // Return all pair conversations involving the user
      const userConvs = await conversationSyncModel.find({
        $or: [{ userA: currentUsername }, { userB: currentUsername }],
      });

      return res.status(200).json({
        success: true,
        conversations: userConvs.map((c) => ({
          peerUsername: c.userA === currentUsername ? c.userB : c.userA,
          updationId: c.updationId,
          lastSender: c.lastSender,
          chatPayload: c.chatPayload,
        })),
      });
    }

    const pairKey = conversationSyncModel.getPairKey(currentUsername, peerUsername);
    let conv = await conversationSyncModel.findOne({ pairKey });

    // Case 1: First time conversation created on server
    if (!conv) {
      const initialUpdationId = Date.now();
      const initialPayload = typeof localChatPayload === "string" ? localChatPayload : JSON.stringify(localChatPayload || []);

      conv = await conversationSyncModel.create({
        pairKey,
        userA: [currentUsername, peerUsername.toLowerCase()].sort()[0],
        userB: [currentUsername, peerUsername.toLowerCase()].sort()[1],
        updationId: initialUpdationId,
        chatPayload: initialPayload,
        lastSender: currentUsername,
      });

      return res.status(200).json({
        success: true,
        updationId: conv.updationId,
        chatPayload: conv.chatPayload,
        status: "synced_initial",
      });
    }

    // Case 2: Client has NEWER local changes (Client Updation ID > Server Updation ID)
    if (clientUpdationId > conv.updationId && localChatPayload) {
      conv.updationId = clientUpdationId;
      conv.chatPayload = typeof localChatPayload === "string" ? localChatPayload : JSON.stringify(localChatPayload);
      conv.lastSender = currentUsername;
      await conv.save();

      return res.status(200).json({
        success: true,
        updationId: conv.updationId,
        chatPayload: conv.chatPayload,
        status: "server_updated_to_client_latest",
      });
    }

    // Case 3: Client is LAGGED (Server Updation ID > Client Updation ID) -> Send latest server chat payload
    return res.status(200).json({
      success: true,
      updationId: conv.updationId,
      chatPayload: conv.chatPayload,
      lastSender: conv.lastSender,
      status: conv.updationId > clientUpdationId ? "client_updated_to_server_latest" : "already_in_sync",
    });
  } catch (error) {
    console.error("Updation Sync Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Sync failed",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Controller: Send/Append New Message & Advance Updation ID
| Endpoint: POST /api/auth/messages/send
|--------------------------------------------------------------------------
*/
export async function send_message(req, res) {
  try {
    const payload = getTokenPayload(req);
    const authUser = await userModel.findById(payload.id);

    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const currentUsername = authUser.username.toLowerCase();
    const { receiverUsername, fullChatPayload, newUpdationId } = req.body;

    if (!receiverUsername || !fullChatPayload) {
      return res.status(400).json({
        success: false,
        message: "receiverUsername and fullChatPayload are required",
      });
    }

    const pairKey = conversationSyncModel.getPairKey(currentUsername, receiverUsername);
    let conv = await conversationSyncModel.findOne({ pairKey });

    const nextUpdationId = newUpdationId || Date.now();
    const payloadStr = typeof fullChatPayload === "string" ? fullChatPayload : JSON.stringify(fullChatPayload);

    if (!conv) {
      conv = await conversationSyncModel.create({
        pairKey,
        userA: [currentUsername, receiverUsername.toLowerCase()].sort()[0],
        userB: [currentUsername, receiverUsername.toLowerCase()].sort()[1],
        updationId: nextUpdationId,
        chatPayload: payloadStr,
        lastSender: currentUsername,
      });
    } else {
      conv.updationId = nextUpdationId;
      conv.chatPayload = payloadStr;
      conv.lastSender = currentUsername;
      await conv.save();
    }

    return res.status(200).json({
      success: true,
      updationId: conv.updationId,
      chatPayload: conv.chatPayload,
    });
  } catch (error) {
    console.error("Send/Updation Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update chat state",
    });
  }
}
