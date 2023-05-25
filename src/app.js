import express from "express";
import logger from "morgan";
import cors from "cors";
import path from "node:path";
import transactionRouter from "./api/transaction.js";
import { usersRouter } from "./api/user.js";

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "src", "public")));

app.use("/api/transactions", transactionRouter);
app.use("/api/users", usersRouter);
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;
