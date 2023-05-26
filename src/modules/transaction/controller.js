import { Category, Transaction } from "./model.js";
import * as TransactionService from "./service.js";
import Joi from "joi";

export const createNewTransaction = async (req, res) => {
  try {
    const user = req.user;
    const { name, amount, categoryId } = req.body;
    if (!name || !amount || !categoryId)
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
      categoryId: Joi.string().required(),
    });
    const { error } = transactionSchema.validate({
      name,
      amount,
      categoryId,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    const category = await Category.findOne({ _id: categoryId });
    const categoryName = category.name;
    const type = category.type;
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
      categoryName
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
    const currentTransactionData = await Transaction.findOneAndUpdate({
      _id: transactionId,
    });
    const prevAmount = currentTransactionData.amount;
    const prevType = currentTransactionData.type;
    let balance = parseFloat(user.balance);
    const { name, amount, categoryId } = req.body;
    const categoryData = await Category.findOne({ _id: categoryId });
    if (!categoryData)
      return res
        .status(404)
        .json({ message: "there is no category with such id" });
    console.log(categoryId);
    const category = categoryData.name;
    const type = categoryData.type;
    const amountParsed = parseFloat(amount);
    const updatedTransactionSchema = Joi.object({
      name: Joi.string().min(3).max(40),
      amount: Joi.number().min(0.01).max(99999999999999).precision(2),
      categoryId: Joi.string(),
    });
    const { error } = updatedTransactionSchema.validate({
      name,
      amount: amountParsed,
      categoryId,
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
      { name, amount, category, type }
    );
    return res.status(200).json(updatedTransaction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    const removedTransaction = await TransactionService.deleteTransaction(
      transactionId
    );
    if (!removedTransaction) return res.sendStatus(404);
    return res.json(removedTransaction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await TransactionService.getTransactionCategories();
    console.log(categories);
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// export const createCategory = async (req, res) => {
//   try {
//     const { name, type } = req.body;
//     const newCategory = await TransactionService.createCategory(name, type);
//     return res.status(201).json(newCategory);
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };
