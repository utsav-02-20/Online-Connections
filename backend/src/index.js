import app from "./app.js";
import config from "./config/config.js";
import connectDB from "./config/database.js";
import dotenv from "dotenv";

dotenv.config();
export const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Health Check Endpoint
|--------------------------------------------------------------------------
*/
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Online Connections API Server is running",
  });
});

/*
|--------------------------------------------------------------------------
| Start Server (Local vs Vercel Serverless)
|--------------------------------------------------------------------------
*/
connectDB().catch((err) => console.error("Database connection error:", err));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

/*
|--------------------------------------------------------------------------
| 404 Handler (Keep this LAST)
|--------------------------------------------------------------------------
*/
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

export default app;