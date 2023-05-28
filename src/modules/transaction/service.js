import { Category, Transaction } from "./model.js";

export const createNew = (
  comment,
  amount,
  type,
  userId,
  balanceAfter,
  category,
  date
) =>
  Transaction.create({
    comment,
    amount,
    type,
    userId,
    balanceAfter,
    category,
    date,
  });

export const getUserTransactions = (userId) => Transaction.find({ userId });

export const updateTransaction = (transactionId, updatedTransaction) =>
  Transaction.findOneAndUpdate({ _id: transactionId }, updatedTransaction, {
    new: true,
  });

export const deleteTransaction = (transactionId) =>
  Transaction.findOneAndDelete({ _id: transactionId });

export const getTransactionCategories = () => Category.find();

// export const createCategory = (name, type) => Category.create({ name, type });
