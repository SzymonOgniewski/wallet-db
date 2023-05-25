import { Transaction } from "./model.js";

export const createNew = (name, amount, type, userId, balanceAfter, category) =>
  Transaction.create({
    name,
    amount,
    type,
    userId,
    balanceAfter,
    category,
  });

export const getUserTransactions = (userId) => Transaction.find({ userId });

export const updateTransaction = (transactionId, updatedTransaction) =>
  Transaction.findOneAndUpdate({ _id: transactionId }, updatedTransaction, {
    new: true,
  });
