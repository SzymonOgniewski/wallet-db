import * as TransactionService from "./service.js";
import Joi from "joi";

export const createNewTransaction = async (req, res) => {
  try {
    const user = req.user;
    const { name, amount, type, category, comment } = req.body;
    // const transactionSchema = Joi.object({
    //   name: Joi.string().required().min(3).max(40),
    //   amount: Joi.number().required().min(1).max(15),

    // });
    // const { error } = schema.validate({
    //   name: name,
    //   amount: amount,
    // });
    let balanceAfter = user.balance;
    const amountParsed = JSON.parse(amount);
    if (!name || !amount || !type || !category)
      return res
        .status(400)
        .json({ message: "Fields: name, amount, type are required." });
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
      category,
      comment
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
