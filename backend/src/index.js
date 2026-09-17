import app from "./app.js";
import config from "./config/config.js";
import connectDB from "./config/database.js";
import { PORT } from "./config/config.js";

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
| 404 Handler (Keep this LAST)
|--------------------------------------------------------------------------
*/
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/*
|--------------------------------------------------------------------------
| Start Server (Local vs Vercel Serverless)
|--------------------------------------------------------------------------
*/
connectDB().catch((err) => console.error("Database connection error:", err));

// if (process.env.NODE_ENV !== "production") {
//   app.listen(config.PORT, () => {
//     console.log(`Server running on http://localhost:${config.PORT}`);
//   });
// }
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;