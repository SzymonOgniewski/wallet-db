import { Schema, model } from "mongoose";

export const Transaction = model(
  "Transaction",
  new Schema({
    name: {
      type: String,
      required: [true, "set name of transaction"],
    },
    transactionDate: {
      type: String,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
    },
    amount: {
      type: Number,
      required: true,
    },
    category: { type: String },
    userId: { type: String, required: true },
    balanceAfter: {
      type: Number,
    },
  })
);

export const Category = model(
  "categorie",
  new Schema({
    name: { type: String },
    type: { type: String, enum: ["INCOME", "EXPENSE"] },
  })
);
