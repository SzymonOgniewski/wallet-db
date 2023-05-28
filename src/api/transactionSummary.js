import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { transactionsSummaryController } from "../modules/transactionSummary/controller.js";
export const transactionsSummaryRouter = Router();

transactionsSummaryRouter.get("/", auth, transactionsSummaryController);
