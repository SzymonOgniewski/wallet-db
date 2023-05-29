//import { TransactionSummary } from "./model.js";
import { Transaction } from "../transaction/model.js";
export const monthlySummaryForUser = (userId, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  return Transaction.aggregate([
    {
      $match: {
        transactionDate: { $gt: new Date("2023-05-28") }, // Dopasowanie do miesiąca i roku
        userId: userId.toString(), // Dopasowanie do konkretnego użytkownika
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
