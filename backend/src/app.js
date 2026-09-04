import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Global Middlewares
|--------------------------------------------------------------------------
*/

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