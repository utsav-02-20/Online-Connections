import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

/*
|--------------------------------------------------------------------------
| Helper Function: Extract & Verify JWT Token
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
| Controller: Get Logged-in User Profile
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

        const userResponse = await buildUserResponse(user);

        return res.status(200).json({
            success: true,
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
    get_me,
};