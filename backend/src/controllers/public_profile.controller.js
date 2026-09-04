import userModel from "../models/user.model.js";

/*
|--------------------------------------------------------------------------
| Controller: Get Public User Profile
|--------------------------------------------------------------------------
| Route  : GET /api/auth/profile/:username
| Access : Public (No Authentication Required)
|
| Description:
| - Fetches a user's public profile using their username.
| - Excludes sensitive fields like password.
| - Returns only public information.
|--------------------------------------------------------------------------
*/

// Helper: Return only public fields
function buildPublicUserResponse(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic || "",
    about: user.about || "",
    friends: Array.isArray(user.friends) ? user.friends : [],
    createdAt: user.createdAt,
  };
}

export async function get_public_profile(req, res) {
  try {
    const { username } = req.params;

    const user = await userModel.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: buildPublicUserResponse(user),
    });
  } catch (error) {
    console.error("Public Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}