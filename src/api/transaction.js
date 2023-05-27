import express from "express";
import { auth } from "../middlewares/auth.js";
import * as TransactionController from "../modules/transaction/controller.js";

const api = express.Router();

api.post("/", auth, TransactionController.createNewTransaction);
api.get("/", auth, TransactionController.userTransactions);

export default api;
