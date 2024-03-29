import { Category, Transaction } from "./model.js";
import * as TransactionService from "./service.js";
import Joi from "joi";

export const createNewTransaction = async (req, res) => {
  try {
    const user = req.user;
    const { comment, amount, categoryId, date } = req.body;
    if (!amount)
      return res.status(400).json({ message: "Field amount is required" });
    const transactionSchema = Joi.object({
      comment: Joi.string().max(40),
      amount: Joi.number()
        .required()
        .min(0.01)
        .max(99999999999999)
        .precision(2),
      categoryId: Joi.string(),
    });
    const { error } = transactionSchema.validate({
      comment,
      amount,
      categoryId,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    let type = "EXPENSE";
    const category = await Category.findOne({ _id: categoryId });
    if (category) type = category.type;
    let userBalance = user.balance;
    let balanceAfter;
    let amountParsed = parseFloat(amount);
    type === "INCOME"
      ? (userBalance += amountParsed)
      : (userBalance -= amountParsed);
    user.balance = userBalance.toFixed(2);
    balanceAfter = userBalance;
    await user.save();
    const newTransaction = await TransactionService.createNew(
      comment,
      amountParsed.toFixed(2),
      type,
      user.id,
      balanceAfter.toFixed(2),
      categoryId,
      date.toString()
    );
    console.log(
      comment,
      amountParsed.toFixed(2),
      type,
      user.id,
      balanceAfter.toFixed(2),
      categoryId,
      date.toString()
    );
    return res.status(201).json(newTransaction);
  } catch (error) {
    const { categoryId } = req.body;
    if (
      error.message ===
      `Cast to ObjectId failed for value \"${categoryId}\" (type string) at path \"_id\" for model \"categorie\"`
    )
      return res.status(404).json({ message: "invalid categoryId" });
    return res.status(500).json({ message: error.message });
  }
};

export const userTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
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
    const currentTransactionData = await Transaction.findOne({
      _id: transactionId,
    });

    const prevAmount = currentTransactionData.amount;
    const prevType = currentTransactionData.type;
    let balance = parseFloat(user.balance);
    const { comment, amount, categoryId, date } = req.body;
    let categoryData;
    categoryId
      ? (categoryData = await Category.findOne({ _id: categoryId }))
      : (categoryData = await Category.findOne({
          _id: currentTransactionData.categoryId,
        }));
    if (!categoryData)
      return res.status(400).json({ message: "invalid category id" });
    const category = categoryData.name;
    const type = categoryData.type;
    const amountParsed = parseFloat(amount);
    const updatedTransactionSchema = Joi.object({
      comment: Joi.string().max(40),
      amount: Joi.number().min(0.01).max(99999999999999).precision(2),
      categoryId: Joi.string(),
    });
    const { error } = updatedTransactionSchema.validate({
      comment,
      amount: amountParsed,
      categoryId,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    if (amountParsed !== currentTransactionData.amount || prevType !== type) {
      prevType === "INCOME" ? (balance -= prevAmount) : (balance += prevAmount);
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
      { comment, amount, category, type, date }
    );
    return res.status(200).json(updatedTransaction);
  } catch (error) {
    const { categoryId } = req.body;
    if (
      error.message ===
      `Cast to ObjectId failed for value \"${categoryId}\" (type string) at path \"_id\" for model \"categorie\"`
    )
      return res.status(404).json({ message: "invalid categoryId" });
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const user = req.user;
    const transactionId = req.params.transactionId;
    const transaction = await Transaction.findOne({ _id: transactionId });
    if (!transaction) return res.sendStatus(404);
    const removedTransaction = await TransactionService.deleteTransaction(
      transactionId
    );
    if (!removedTransaction) return res.sendStatus(404);
    transaction.type === "INCOME"
      ? (user.balance -= Number(transaction.amount))
      : (user.balance += Number(transaction.amount));
    await user.save();
    return res.json(removedTransaction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await TransactionService.getTransactionCategories();
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
