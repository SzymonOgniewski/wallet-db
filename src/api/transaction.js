import express from "express";
import * as TransactionController from "../modules/transaction/controller.js";

const api = express.Router();

api.post("/", TransactionController.createNewTransaction);

export default api;
