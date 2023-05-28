import { Schema, model } from "mongoose";

export const Transaction = model(
  "Transaction",
  new Schema({
    comment: {
      type: String,
    },
    transactionDate: {
      type: String,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
      defaykt: "EXPENSE",
    },
    amount: {
      type: Number,
      required: true,
    },
    category: { type: String, default: "default transaction" },
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
