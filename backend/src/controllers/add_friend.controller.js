import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

/*
|--------------------------------------------------------------------------
| Helper Function: Extract & Verify JWT Token
|--------------------------------------------------------------------------
| - Reads Bearer token from Authorization header.
| - Verifies JWT using JWT_SECRET.
| - Returns decoded payload containing logged-in user ID.
|--------------------------------------------------------------------------
*/
function getTokenPayload(req) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new Error("Token missing");
  }

  return jwt.verify(token, config.JWT_SECRET);
}

/*
|--------------------------------------------------------------------------
| Helper Function: Build Safe User Response
|--------------------------------------------------------------------------
| - Returns only non-sensitive user information.
|--------------------------------------------------------------------------
*/
function buildUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    profilePic: user.profilePic,
    friends: user.friends,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/*
|--------------------------------------------------------------------------
| Controller: Add Friend
|--------------------------------------------------------------------------
| Route  : POST /api/user/:username/friends/:friendUsername
| Access : Private (JWT Required)
|
| Description:
| - Authenticates the logged-in user.
| - Allows a user to add another user as a friend.
| - Prevents adding yourself.
| - Prevents duplicate friends.
| - Returns the updated user profile.
|--------------------------------------------------------------------------
*/
export async function add_friend(req, res) {
  try {
    // Verify JWT and get logged-in user ID
    const decoded = getTokenPayload(req);

    // Get usernames from URL
    const { username, friendUsername } = req.params;

    const normalizedUsername = String(username || "").trim().toLowerCase();
    const normalizedFriendUsername = String(friendUsername || "")
      .trim()
      .toLowerCase();

    // Find authenticated user
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Ensure user is modifying only their own account
    if (user.username !== normalizedUsername) {
      return res.status(403).json({
        success: false,
        message: "You can only add friends to your own account",
      });
    }

    // Prevent invalid or self friendship
    if (
      !normalizedFriendUsername ||
      normalizedFriendUsername === normalizedUsername
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid friend username",
      });
    }

    // Find friend account
    const friend = await userModel.findOne({
      username: normalizedFriendUsername,
    });

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: "Friend user not found",
      });
    }

    // Add friend only if not already added
    if (!user.friends.includes(normalizedFriendUsername)) {
      user.friends.push(normalizedFriendUsername);
      await user.save();
    }

    // Return updated profile
    return res.status(200).json({
      success: true,
      message: "Friend added successfully",
      user: buildUserResponse(user),
    });

  } catch (error) {
    // Handle authentication errors
    if (
      error.message === "Token missing" ||
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Handle unexpected server errors
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}; 

export default {
  add_friend,
};