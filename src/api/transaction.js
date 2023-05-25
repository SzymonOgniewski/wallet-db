import express from "express";
import * as transactionController from "../modules/transaction/controller.js";
import { auth } from "../middlewares/auth.js";

const api = express.Router();

api.post("/", auth, transactionController.createNewTransaction);
api.get("/", auth, transactionController.userTransactions);

export default api;
