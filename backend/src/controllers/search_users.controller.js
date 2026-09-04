/*
|--------------------------------------------------------------------------
| Controller: Search Users by Username
|--------------------------------------------------------------------------
| Route  : GET /api/user/search?username=<query>
| Access : Public
|
| Description:
| - Searches users whose username matches the query.
| - Uses a case-insensitive partial search with MongoDB regex.
| - Returns a maximum of 10 matching usernames.
|--------------------------------------------------------------------------
*/

import userModel from "../models/user.model.js";

export async function search_users(req, res) {
    try {
        // Read username query from URL
        const rawQuery = String(req.query.username || "")
            .trim()
            .toLowerCase();

        // Return empty array if query is empty
        if (!rawQuery) {
            return res.status(200).json({
                success: true,
                users: [],
            });
        }

        // Search usernames using case-insensitive regex
        const users = await userModel
            .find({
                username: { $regex: rawQuery, $options: "i" },
            })
            .select("username profilePic role") // Return only required fields
            .limit(10);

        // Return matching users
        return res.status(200).json({
            success: true,
            users: users.map((user) => ({
                username: user.username,
                profilePic: user.profilePic,
                role: user.role,
            })),
        });
    } catch (error) {
        // Handle unexpected server errors
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export default {
    search_users,
};