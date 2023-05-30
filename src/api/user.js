import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import * as userController from "../modules/user/controller.js";
export const usersRouter = Router();

usersRouter.post("/sign-up", userController.signup);
usersRouter.post("/sign-in", userController.login);
usersRouter.get("/sign-out", auth, userController.logout);
usersRouter.get("/current", auth, userController.current);
usersRouter.get("/verify/:verificationToken", userController.verificationToken);
usersRouter.post("/verify", userController.verify);
usersRouter.post("/reset-password/:token", userController.resetPassword);
usersRouter.post("/forgot-password", userController.forgotPassword);
