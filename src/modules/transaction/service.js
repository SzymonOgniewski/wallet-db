import { Transaction } from "./model.js";

export const createNew = (name, amount, type, userId, balanceAfter) =>
  Transaction.create({ name, amount, type, userId, balanceAfter });

export const getUserTransactions = (userId) => Transaction.find({ userId });
