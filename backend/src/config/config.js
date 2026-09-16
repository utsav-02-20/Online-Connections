import "dotenv/config";

const config = {
  MONGO_URI: process.env.MONGODB_URI || "mongodb://localhost:27017",
  DB_NAME: process.env.DB_NAME || "online_connections_db",
  PORT: process.env.PORT || 5000,
  JWT_SECRET:
    process.env.JWT_SECRET || "default_jwt_secret_key_for_dev_and_testing",
};

export default config;