import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import * as userController from "../modules/user/controller.js";
export const usersRouter = Router();


usersRouter.post("/sing-up", userController.signup);
usersRouter.post("/sign-in", userController.login);
usersRouter.get("/sign-out", auth, userController.logout);
usersRouter.get("/current", auth, userController.current);
usersRouter.get("/verify/:verificationToken", userController.verificationToken);
usersRouter.post("/verify", userController.verifiy);
