import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import app from "./app.js";
import config from "./config/config.js";
import connectDB from "./config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");
const loginPage = path.join(publicDir, "pages", "login.html");
const userPage = path.join(publicDir, "pages", "user.html");
const dashboardPage = path.join(publicDir, "pages", "dashboard.html");

app.use(express.static(publicDir));

app.get("/", (_req, res) => {
  res.sendFile(loginPage);
});

app.get("/login", (_req, res) => {
  res.sendFile(loginPage);
});

app.get("/register", (_req, res) => {
  res.sendFile(loginPage);
});

app.get("/:username/page_routes", (_req, res) => {
  res.sendFile(userPage);
});

app.get("/:username/my_dashboard", (_req, res) => {
  res.sendFile(dashboardPage);
});

const startServer = async () => {
  await connectDB();

  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
  });
};

startServer();
