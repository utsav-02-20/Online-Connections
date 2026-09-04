import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

/*
|--------------------------------------------------------------------------
| Helper Function: Build Safe Login Response
|--------------------------------------------------------------------------
| - Removes sensitive fields like password.
| - Includes JWT access token with user details.
|--------------------------------------------------------------------------
*/
function buildUserResponse(user, accessToken) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    profilePic: user.profilePic,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    accessToken,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/*
|--------------------------------------------------------------------------
| Controller: User Login
|--------------------------------------------------------------------------
| Route  : POST /api/auth/login
| Access : Public
|
| Description:
| - Allows login using either username or email.
| - Verifies the user's password.
| - Generates a JWT access token valid for 15 minutes.
| - Returns authenticated user information and token.
|--------------------------------------------------------------------------
*/
export const login = async (req, res) => {
  try {
    // Extract login credentials
    const { email, username, password } = req.body;

    // Use either email or username as identifier
    const identifier = (email || username || "")
      .trim()
      .toLowerCase();

    // Validate required fields
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required",
      });
    }

    // Find user by email or username
    const user = await userModel
      .findOne({
        $or: [
          { email: identifier },
          { username: identifier },
        ],
      })
      .select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash incoming password and compare with stored password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (user.password !== hashedPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT access token
    const accessToken = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Return login response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: buildUserResponse(user, accessToken),
    });

  } catch (error) {
    // Handle unexpected server errors
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default {
  login,
};