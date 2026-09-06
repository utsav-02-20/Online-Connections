import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

/*
|--------------------------------------------------------------------------
| Helper Function: Extract & Verify JWT Token
|--------------------------------------------------------------------------
| - Reads Bearer token from Authorization header.
| - Verifies JWT using JWT_SECRET.
| - Returns decoded payload containing user ID.
| - Throws an error if token is missing or invalid.
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
| Helper Function: Build Safe User Response
|--------------------------------------------------------------------------
| - Removes sensitive fields before sending data to client.
| - Returns only the required user information.
|--------------------------------------------------------------------------
*/
function buildUserResponse(user) {
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

/*
|--------------------------------------------------------------------------
| Controller: Get Logged-in User Profile
|--------------------------------------------------------------------------
| Route  : GET /api/user/me
| Access : Private (JWT Required)
|
| Returns the authenticated user's profile without password.
|--------------------------------------------------------------------------
*/
export async function get_me(req, res) {
    try {
        const decoded = getTokenPayload(req);

        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user: buildUserResponse(user),
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
}; 

export default {
    get_me,
};