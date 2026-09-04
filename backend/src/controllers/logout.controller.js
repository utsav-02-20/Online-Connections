import jwt from "jsonwebtoken";
import config from "../config/config.js";

/*
|--------------------------------------------------------------------------
| Controller: User Logout
|--------------------------------------------------------------------------
| Route  : POST /api/auth/logout
| Access : Private (Refresh Token Cookie)
|
| Description:
| - Reads refresh token from HTTP-only cookie.
| - Verifies the refresh token (optional security check).
| - Clears the refresh token cookie.
| - Logs the user out.
|--------------------------------------------------------------------------
*/

export const logout = async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    // If cookie does not exist
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Already logged out",
      });
    }

    // Verify refresh token
    jwt.verify(refreshToken, config.JWT_SECRET);

    // Remove refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,       // false for local HTTP development
      sameSite: "strict",
    });

    // Success response
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {
    // Clear cookie even if token is invalid or expired
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  }
};

export default {
  logout,
};