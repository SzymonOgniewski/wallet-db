import { Transaction } from "./model.js";

export const createNew = (
  name,
  amount,
  type,
  userId,
  balanceAfter,
  category,
  comment
) =>
  Transaction.create({
    name,
    amount,
    type,
    userId,
    balanceAfter,
    category,
    comment,
  });

export const getUserTransactions = (userId) => Transaction.find({ userId });
