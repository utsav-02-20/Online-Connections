import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";

import config from "./config/config.js";

const app = express();

// CORS Middleware for Next.js frontend
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
  ];
  if (config.CLIENT_URL) {
    allowedOrigins.push(config.CLIENT_URL.replace(/\/+$/, ""));
  }
  
  const origin = req.headers.origin;

  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes("*"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (origin) {
    // In production deployments where origin may differ or match custom domain
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", config.CLIENT_URL || "*");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON request body
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// HTTP request logger
app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication & User APIs
app.use("/api/auth", authRouter);

export default app;