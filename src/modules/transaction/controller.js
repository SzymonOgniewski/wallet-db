import { Transaction } from "./model.js";
import * as TransactionService from "./service.js";
import Joi from "joi";

export const createNewTransaction = async (req, res) => {
  try {
    const user = req.user;
    const { name, amount, type, category } = req.body;
    if (!name || !amount || !type || !category)
      return res
        .status(400)
        .json({ message: "Fields: name, amount, type are required." });
    const transactionSchema = Joi.object({
      name: Joi.string().required().min(3).max(40),
      amount: Joi.number()
        .required()
        .min(0.01)
        .max(99999999999999)
        .precision(2),
      type: Joi.string().valid("INCOME", "EXPENSE").required(),
    });
    const { error } = transactionSchema.validate({
      name,
      amount,
      type,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    let balanceAfter = user.balance;
    let amountParsed = parseFloat(amount);
    type === "INCOME"
      ? (balanceAfter += amountParsed)
      : (balanceAfter -= amountParsed);
    user.balance = balanceAfter.toFixed(2);
    await user.save();
    const newTransaction = await TransactionService.createNew(
      name,
      amountParsed.toFixed(2),
      type,
      user.id,
      balanceAfter.toFixed(2),
      category
    );
    return res.status(201).json(newTransaction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const userTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userTransactions = await TransactionService.getUserTransactions(
      userId
    );
    return res.status(200).json({ userTransactions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const user = req.user;
    const transactionId = req.params.transactionId;
    const updatedTransactionFields = req.body;
    const currentTransactionData = await Transaction.findOneAndUpdate({
      _id: transactionId,
    });
    const prevAmount = currentTransactionData.amount;
    const prevType = currentTransactionData.type;
    let balance = parseFloat(user.balance);
    const { name, amount, type, category } = updatedTransactionFields;
    const amountParsed = parseFloat(amount);
    const updatedTransactionSchema = Joi.object({
      name: Joi.string().min(3).max(40),
      amount: Joi.number().min(0.01).max(99999999999999).precision(2),
      type: Joi.string().valid("INCOME", "EXPENSE"),
    });
    const { error } = updatedTransactionSchema.validate({
      name,
      amount: amountParsed,
      type,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    if (amountParsed !== currentTransactionData.amount || prevType !== type) {
      let prevBalanceAfter = currentTransactionData.balanceAfter;
      prevType === "INCOME"
        ? (balance = prevBalanceAfter - prevAmount)
        : (balance = prevBalanceAfter + prevAmount);
      if (!type) {
        prevType === "INCOME"
          ? (balance += amountParsed)
          : (balance -= amountParsed);
      } else if (type === "INCOME") {
        balance += amountParsed;
      } else {
        balance -= amountParsed;
      }
      user.balance = balance;
      await user.save();
      currentTransactionData.balanceAfter = balance;
      await currentTransactionData.save();
    }
    const updatedTransaction = await TransactionService.updateTransaction(
      transactionId,
      updatedTransactionFields
    );
    return res.status(200).json(updatedTransaction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
