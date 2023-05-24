import { Transaction } from "./model.js";

export const createNew = (name, amount, type, userId, balanceAfter) =>
  Transaction.create({ name, amount, type, userId, balanceAfter });
