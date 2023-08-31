import { Transaction } from "../transaction/model.js";

export const monthlySummaryForUser = (userId, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return Transaction.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        userId: userId.toString(),
      },
    },
    {
      $group: {
        _id: { $toObjectId: "$categoryId" },
        total: { $sum: "$amount" },
      },
    },
    {
      $lookup: {
        from: "categories",
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
