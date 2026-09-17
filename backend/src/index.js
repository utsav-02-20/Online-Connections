import app from "./app.js";
import config from "./config/config.js";
import connectDB from "./config/database.js";

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
| Start Server
|--------------------------------------------------------------------------
*/
const startServer = async () => {
  try {
    await connectDB();

    app.listen(config.PORT, () => {
      console.log(`Server running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();