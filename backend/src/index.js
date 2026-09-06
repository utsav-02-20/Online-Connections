import path from "path";
import express from "express";
import { fileURLToPath } from "url";

import app from "./app.js";
import config from "./config/config.js";
import connectDB from "./config/database.js";

/*
|--------------------------------------------------------------------------
| File Paths
|--------------------------------------------------------------------------
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "..", "Public");

const loginPage = path.join(publicDir, "pages", "login.html");
const userPage = path.join(publicDir, "pages", "user.html");
const dashboardPage = path.join(publicDir, "pages", "dashboard.html");

/*
|--------------------------------------------------------------------------
| Static Files
|--------------------------------------------------------------------------
*/

app.use(express.static(publicDir));

/*
|--------------------------------------------------------------------------
| Frontend Routes
|--------------------------------------------------------------------------
*/

// Landing / Login
app.get("/", (_req, res) => res.sendFile(loginPage));

// Login
app.get("/login", (_req, res) => res.sendFile(loginPage));

// Register
app.get("/register", (_req, res) => res.sendFile(loginPage));

// Public User Profile
app.get("/:username/page_routes", (_req, res) => res.sendFile(userPage));

// User Dashboard
app.get("/:username/my_dashboard", (_req, res) => res.sendFile(dashboardPage));

// Friends Page
app.get("/:username/friends", (_req, res) => res.sendFile(dashboardPage));

// Settings Page
app.get("/:username/settings", (_req, res) => res.sendFile(dashboardPage));

// Search Page
app.get("/search", (_req, res) => res.sendFile(userPage));

/*
|--------------------------------------------------------------------------
| 404 Handler (Keep this LAST)
|--------------------------------------------------------------------------
*/

app.use((_req, res) => {
  res.status(404).sendFile(loginPage);
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