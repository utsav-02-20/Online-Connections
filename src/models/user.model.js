import mongoose from "mongoose";


// production grade logic
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Minimum 3 characters"],
      maxlength: [30, "Maximum 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Invalid username"],
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    profilePic: {
      type: String,
      default: "",
      trim: true,
    },

    about: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "About must be under 500 characters"],
    },

    friends: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


// const userSchema = new mongoose.Schema({
//     username: {
//         type: String , 
//         required: [true , "Username is required !!"] , 
//         unique: [true , "Username must be unique"]
//     } , 
//     email: {
//         type: String,
//         required: [true, "Email is required"],
//         unique: [true, "Email must be unique"]
//     },

//     password: {
//         type: String,
//         required: [true, "Password is required"]
//     }
// }) ;

const userModel = mongoose.model("user" , userSchema) ; 

export default userModel ; 
