import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

/*
|--------------------------------------------------------------------------
| Helper Function: Build Safe User Response
|--------------------------------------------------------------------------
| - Returns only non-sensitive user information.
| - Includes access token when provided.
|--------------------------------------------------------------------------
*/
function buildUserResponse(user, token) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone || "",
    phoneVerified: Boolean(user.phoneVerified),
    address: user.address || "",
    profilePic: user.profilePic || "",
    about: user.about || "",
    friends: Array.isArray(user.friends) ? user.friends : [],
    ...(token ? { accessToken: token } : {}),
  };
}

/*
|--------------------------------------------------------------------------
| Helper Function: Extract & Verify JWT Token
|--------------------------------------------------------------------------
| - Reads Bearer token from Authorization header.
| - Verifies JWT using JWT_SECRET.
| - Returns decoded payload containing user ID.
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
| Controller: User Registration
|--------------------------------------------------------------------------
| Route  : POST /api/auth/register
| Access : Public
|
| Description:
| - Registers a new user with username, email, and password.
| - Checks for existing username or email.
| - Hashes password using SHA-256.
| - Generates an access token and refresh token.
| - Stores refresh token in an HTTP-only cookie.
|--------------------------------------------------------------------------
*/
export const register = async (req, res) => {
  try {
    // Extract user details
    let { username, email, password } = req.body;

    // Normalize input
    username = typeof username === "string" ? username.trim().toLowerCase() : "";
    email = typeof email === "string" ? email.trim().toLowerCase() : "";

    // Validate required fields
    if (!username || !email || !password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    // Check if username or email already exists
    const isAlreadyRegistered = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isAlreadyRegistered) {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    // Hash password before storing
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Create new user
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate access token (15 minutes)
    const accessToken = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate refresh token (7 days)
    const refreshToken = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Store refresh token in secure cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return created user
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: buildUserResponse(user, accessToken),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default {
  register,
};