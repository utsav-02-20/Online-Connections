import { Router } from "express";
import * as authController from "../controllers/index.js";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/get-me", authController.get_me);
authRouter.get("/profile/:username", authController.get_public_profile);
authRouter.patch("/profile/:username", authController.update_profile);
authRouter.get("/users/search", authController.search_users);
authRouter.post("/friends/:username/:friendUsername", authController.add_friend);
authRouter.delete("/friends/:username/:friendUsername", authController.remove_friend);

// Message Synchronization & Offline Storage Endpoints
authRouter.post("/messages/sync", authController.sync_messages);
authRouter.post("/messages/send", authController.send_message);

export default authRouter;