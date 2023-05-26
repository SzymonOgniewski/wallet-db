import { Category, Transaction } from "./model.js";

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

export const updateTransaction = (transactionId, updatedTransaction) =>
  Transaction.findOneAndUpdate({ _id: transactionId }, updatedTransaction, {
    new: true,
  });

export const deleteTransaction = (transactionId) =>
  Transaction.findOneAndDelete({ _id: transactionId });

export const getTransactionCategories = () => Category.find();

// export const createCategory = (name, type) => Category.create({ name, type });
