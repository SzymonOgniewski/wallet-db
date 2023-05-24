import * as TransactionService from "./service.js";

export const createNewTransaction = async (req, res) => {
  // user.balance będzie aktualizowany tutaj za pomocą save()
  try {
    const testUser = { userId: "testuser", balance: 3200 };
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
