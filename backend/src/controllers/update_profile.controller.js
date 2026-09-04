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
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        address: user.address,
        profilePic: user.profilePic,
        about: user.about,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

/*
|--------------------------------------------------------------------------
| Controller: Update User Profile
|--------------------------------------------------------------------------
| Route  : PUT /api/user/:username
| Access : Private (JWT Required)
|
| Description:
| - Authenticates the logged-in user using JWT.
| - Allows a user to update only their own profile.
| - Updates only the fields provided in the request body.
| - Prevents duplicate email usage.
| - Returns the updated user profile.
|--------------------------------------------------------------------------
*/
export async function update_profile(req, res) {
    try {
        // Verify JWT and get logged-in user ID
        const decoded = getTokenPayload(req);

        // Get username from URL
        const { username } = req.params;

        // Find authenticated user
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Prevent users from updating another user's profile
        if (user.username !== username) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own profile",
            });
        }

        // Extract allowed fields from request body
        const {
            email,
            phone,
            phoneVerified,
            address,
            profilePic,
            about,
        } = req.body;

        // Update email (check for duplicates)
        if (typeof email === "string") {
            const normalizedEmail = email.trim().toLowerCase();

            const existingUser = await userModel.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id },
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already in use",
                });
            }

            user.email = normalizedEmail;
        }

        // Update phone number
        if (typeof phone === "string") {
            user.phone = phone.trim();

            // Remove verification if phone is empty
            if (!user.phone) {
                user.phoneVerified = false;
            }
        }

        // Update phone verification only if phone exists
        if (typeof phoneVerified === "boolean") {
            user.phoneVerified = phoneVerified && Boolean(user.phone);
        }

        // Update address
        if (typeof address === "string") {
            user.address = address.trim();
        }

        // Update profile picture URL
        if (typeof profilePic === "string") {
            user.profilePic = profilePic.trim();
        }

        // Update about/bio
        if (typeof about === "string") {
            user.about = about.trim();
        }

        // Save updated profile
        await user.save();

        // Return updated profile
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
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
    update_profile,
};