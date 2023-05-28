//import { TransactionSummary } from "./model.js";
import { Transaction } from "../transaction/model.js";
export const monthlySummaryForUser = (userId, year, month) => {
  return Transaction.aggregate([
    {
      $match: {
        transactionDate: { $regex: `^${year}-${month}` }, // Dopasowanie do miesiąca i roku
        userId: userId, // Dopasowanie do konkretnego użytkownika
      },
    },
    {
      $group: {
        _id: "$categoryId", // Grupowanie po kategorii
        total: { $sum: "$amount" }, // Sumowanie kwoty
      },
    },
    {
      $lookup: {
        from: "categories", // Nazwa kolekcji zawierającej informacje o kategoriach
        localField: "_id",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $project: {
        _id: 0,
        "categoryInfo.name": 1,
        "categoryInfo.type": 1,
        total: 1,
      },
    },
  ]);
};
