import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

/**
 * POST "/api/auth/register" - is the full path of api call
 */
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);

/**
 * GET /api/auth/get-me
 */
authRouter.get("/get-me", authController.get_me);
authRouter.get("/profile/:username", authController.get_public_profile);
authRouter.patch("/profile/:username", authController.update_profile);
authRouter.get("/users/search", authController.search_users);
authRouter.post("/friends/:username/:friendUsername", authController.add_friend);

export default authRouter;
