import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

function buildUserResponse(user, token) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone || "",
    phoneVerified: Boolean(user.phoneVerified),
    address: user.address || "",
    profilePic: user.profilePic || "",
    about: user.about || "",
    friends: Array.isArray(user.friends) ? user.friends : [],
    ...(token ? { token } : {}),
  };
}

function getTokenPayload(req) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new Error("Token missing");
  }

  return jwt.verify(token, config.JWT_SECRET);
}

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const isAlreadyRegistered = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isAlreadyRegistered) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const accessToken = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

        const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("refreshToken" , refreshToken , {
      httpOnly: true , 
      secure: true , 
      sameSite: "strict" , 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    }) ; 

    return res.status(201).json({
      message: "User registered successfully",
      user: buildUserResponse(user, accessToken),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || "").trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Username/email and password are required",
      });
    }

    const user = await userModel
      .findOne({
        $or: [{ email: identifier }, { username: identifier }],
      })
      .select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (user.password !== hashedPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    return res.status(200).json({
      message: "Login successful",
      user: buildUserResponse(user, accessToken),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

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
      user: buildUserResponse(user),
    });
  } catch (error) {
    const statusCode = error.message === "Token missing" ? 401 : 500;
    return res.status(statusCode).json({
      message: error.message,
    });
  }
}

export async function get_public_profile(req, res) {
  try {
    const { username } = req.params;

    const user = await userModel.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function update_profile(req, res) {
  try {
    const decoded = getTokenPayload(req);
    const { username } = req.params;

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.username !== username) {
      return res.status(403).json({
        message: "You can only update your own profile",
      });
    }

    const {
      email,
      phone,
      phoneVerified,
      address,
      profilePic,
      about,
    } = req.body;

    if (typeof email === "string") {
      user.email = email.trim().toLowerCase();
    }

    if (typeof phone === "string") {
      user.phone = phone.trim();
      if (!user.phone) {
        user.phoneVerified = false;
      }
    }

    if (typeof phoneVerified === "boolean") {
      user.phoneVerified = phoneVerified && Boolean(user.phone);
    }

    if (typeof address === "string") {
      user.address = address.trim();
    }

    if (typeof profilePic === "string") {
      user.profilePic = profilePic.trim();
    }

    if (typeof about === "string") {
      user.about = about.trim();
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    const statusCode = error.message === "Token missing" ? 401 : 500;
    return res.status(statusCode).json({
      message: error.message,
    });
  }
}

export async function search_users(req, res) {
  try {
    const rawQuery = String(req.query.username || "").trim().toLowerCase();

    if (!rawQuery) {
      return res.status(200).json({
        users: [],
      });
    }

    const users = await userModel
      .find({
        username: { $regex: rawQuery, $options: "i" },
      })
      .select("username")
      .limit(10);

    return res.status(200).json({
      users: users.map((user) => ({
        username: user.username,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function add_friend(req, res) {
  try {
    const decoded = getTokenPayload(req);
    const { username, friendUsername } = req.params;
    const normalizedUsername = String(username || "").trim().toLowerCase();
    const normalizedFriendUsername = String(friendUsername || "").trim().toLowerCase();

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.username !== normalizedUsername) {
      return res.status(403).json({
        message: "You can only add friends to your own account",
      });
    }

    if (!normalizedFriendUsername || normalizedFriendUsername === normalizedUsername) {
      return res.status(400).json({
        message: "Invalid friend username",
      });
    }

    const friend = await userModel.findOne({ username: normalizedFriendUsername });

    if (!friend) {
      return res.status(404).json({
        message: "Friend user not found",
      });
    }

    if (!user.friends.includes(normalizedFriendUsername)) {
      user.friends.push(normalizedFriendUsername);
      await user.save();
    }

    return res.status(200).json({
      message: "Friend added successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    const statusCode = error.message === "Token missing" ? 401 : 500;
    return res.status(statusCode).json({
      message: error.message,
    });
  }
}

// export default register;
