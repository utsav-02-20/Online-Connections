import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

/*
|--------------------------------------------------------------------------
| Helper Function: Extract & Verify JWT Token
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
| Helper Function: Build Safe User Response with Populated Friend Details
|--------------------------------------------------------------------------
*/
async function buildUserResponse(user) {
  const friendList = Array.isArray(user.friends) ? user.friends : [];
  let friendsDetails = [];
  if (friendList.length > 0) {
    const friendDocs = await userModel.find({ username: { $in: friendList } }).select("username profilePic about");
    friendsDetails = friendDocs.map((f) => ({
      id: f._id,
      username: f.username,
      profilePic: f.profilePic || "",
      about: f.about || "",
    }));
  }

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    profilePic: user.profilePic || "",
    about: user.about || "",
    friends: friendList,
    friendsDetails,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/*
|--------------------------------------------------------------------------
| Controller: Add Friend
|--------------------------------------------------------------------------
*/
export async function add_friend(req, res) {
  try {
    const decoded = getTokenPayload(req);
    const { username, friendUsername } = req.params;

    const normalizedUsername = String(username || "").trim().toLowerCase();
    const normalizedFriendUsername = String(friendUsername || "")
      .trim()
      .toLowerCase();

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.username !== normalizedUsername) {
      return res.status(403).json({
        success: false,
        message: "You can only add friends to your own account",
      });
    }

    if (
      !normalizedFriendUsername ||
      normalizedFriendUsername === normalizedUsername
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid friend username",
      });
    }

    const friend = await userModel.findOne({
      username: normalizedFriendUsername,
    });

    if (!friend) {
      return res.status(404).json({
        success: false,
        message: "Friend user not found",
      });
    }

    if (!user.friends.includes(normalizedFriendUsername)) {
      user.friends.push(normalizedFriendUsername);
      await user.save();
    }

    if (!friend.friends.includes(normalizedUsername)) {
      friend.friends.push(normalizedUsername);
      await friend.save();
    }

    const userResponse = await buildUserResponse(user);

    return res.status(200).json({
      success: true,
      message: "Friend added successfully",
      user: userResponse,
    });

  } catch (error) {
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

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Controller: Remove Friend (Unfriend)
|--------------------------------------------------------------------------
*/
export async function remove_friend(req, res) {
  try {
    const decoded = getTokenPayload(req);
    const { username, friendUsername } = req.params;

    const normalizedUsername = String(username || "").trim().toLowerCase();
    const normalizedFriendUsername = String(friendUsername || "")
      .trim()
      .toLowerCase();

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.username !== normalizedUsername) {
      return res.status(403).json({
        success: false,
        message: "You can only modify your own account",
      });
    }

    const friend = await userModel.findOne({
      username: normalizedFriendUsername,
    });

    user.friends = user.friends.filter((f) => f !== normalizedFriendUsername);
    await user.save();

    if (friend) {
      friend.friends = friend.friends.filter((f) => f !== normalizedUsername);
      await friend.save();
    }

    const userResponse = await buildUserResponse(user);

    return res.status(200).json({
      success: true,
      message: "Friend removed successfully",
      user: userResponse,
    });

  } catch (error) {
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

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export default {
  add_friend,
  remove_friend,
};