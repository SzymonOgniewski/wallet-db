// import { Schema, model } from "mongoose";

// export const Transaction = model(
//   "Transaction",
//   new Schema({
//     name: {
//       type: String,
//       required: [true, "set name of transaction"],
//     },
//     transactionDate: {
//       type: String,
//       default: Date.now,
//     },
//     type: {
//       type: String,
//       enum: ["INCOME", "EXPENSE"],
//       required: true,
//     },
//     amount: { type: Number, required: true },
//     comment: { type: String },
//     userId: { type: String, required: true },
//     balanceAfter: { type: Number },
//   })
// );
