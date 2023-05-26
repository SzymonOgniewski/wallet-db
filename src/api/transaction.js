import express from "express";
import * as transactionController from "../modules/transaction/controller.js";
import { auth } from "../middlewares/auth.js";

const api = express.Router();

api.post("/", auth, transactionController.createNewTransaction);
api.get("/", auth, transactionController.userTransactions);
api.patch("/:transactionId", auth, transactionController.updateTransaction);
api.delete("/:transactionId", auth, transactionController.deleteTransaction);

api.get("/categories", auth, transactionController.getCategories);
// api.post("/categories", auth, transactionController.createCategory);

export default api;
