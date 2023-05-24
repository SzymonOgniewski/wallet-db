import { Transaction } from "./model.js";
import * as TransactionService from "./service.js";

const testUser = { userId: "testuser", balance: 3200 };

export const createNewTransaction = async (req, res) => {
  // user.balance będzie aktualizowany tutaj za pomocą save()
  try {
    const { name, amount, type } = req.body;
    if (!name || !amount || !type)
      return res
        .status(400)
        .json({ message: "Fields: name, amount, type are required." });
    const balanceAfter = testUser.balance - amount;
    testUser.balance = balanceAfter;
    const newTransaction = await TransactionService.createNew(
      name,
      amount,
      type,
      testUser.userId,
      balanceAfter
    );
    return res.status(201).json(newTransaction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const userTransactions = async (req, res) => {
  try {
    //const userId = req.user.id
    const userId = testUser.userId;
    const userTransactions = await TransactionService.getUserTransactions(
      userId
    );
    return res.status(200).json({ userTransactions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
