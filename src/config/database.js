import mongoose from "mongoose";
import config from "./config.js" ; 

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${config.MONGO_URI}/${config.DB_NAME}`,
    );
    console.log(
      `\n MongoDB Connected !! DB HOST : ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("MONGODB connection Error : ", error);
    // process
    process.exit(1);
  }
};

export default connectDB;