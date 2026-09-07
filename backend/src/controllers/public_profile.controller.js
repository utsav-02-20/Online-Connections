import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

/*
|--------------------------------------------------------------------------
| Controller: Get Public User Profile
|--------------------------------------------------------------------------
| Route  : GET /api/auth/profile/:username
| Access : Public (Optional Authorization Header for isFriend & mutualFriends)
|
| Description:
| - Fetches public profile of a user by username.
| - Excludes private data (email, full friends array).
| - Returns safe social metrics: friendsCount, isFriend, mutualFriends, createdAt.
|--------------------------------------------------------------------------
*/

// Helper: Extract optional JWT token if provided
function getOptionalTokenPayload(req) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      return jwt.verify(token, config.JWT_SECRET);
    }
  } catch (error) {
    // Unauthenticated request, return null
  }
  return null;
}

export async function get_public_profile(req, res) {
  try {
    const { username } = req.params;
    const normalizedUsername = String(username || "").trim().toLowerCase();

    const user = await userModel.findOne({ username: normalizedUsername }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const targetFriends = Array.isArray(user.friends) ? user.friends : [];
    const friendsCount = targetFriends.length;

    let isFriend = false;
    let mutualFriends = 0;

    // Optional social graph context for logged-in viewer
    const decoded = getOptionalTokenPayload(req);
    if (decoded && decoded.id) {
      const loggedInUser = await userModel.findById(decoded.id);
      if (loggedInUser) {
        const loggedInUsername = loggedInUser.username;
        const loggedInFriends = Array.isArray(loggedInUser.friends)
          ? loggedInUser.friends
          : [];

        // Check if logged-in user is friends with target user
        isFriend = targetFriends.includes(loggedInUsername);

        // Calculate count of mutual friends
        mutualFriends = loggedInFriends.filter((f) =>
          targetFriends.includes(f)
        ).length;
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        profilePic: user.profilePic || "",
        about: user.about || "",
        createdAt: user.createdAt,
        friendsCount,
        isFriend,
        mutualFriends,
      },
    });
  } catch (error) {
    console.error("Public Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export default {
  get_public_profile,
};