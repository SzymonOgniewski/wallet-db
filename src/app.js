import express from "express";
import logger from "morgan";
import cors from "cors";
import path from "node:path";
import transactionRouter from "./api/transaction.js";
import { usersRouter } from "./api/user.js";
import { transactionsSummaryRouter } from "./api/transactionSummary.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Wallet API Docs",
      version: "0.1.0",
      description: "This is wallet API Docs",

      contact: {
        name: "Szymon",
        email: "szymonogniewski00@email.com",
      },
    },
    servers: [
      {
        url: "https://wallet-febk.onrender.com",
      },
    ],
  },
  apis: ["./swagger/*.js"],
};
const specs = swaggerJsdoc(options);

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
const corsOptions = {
  origin: "http://localhost:3001",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(logger(formatsLogger));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "src", "public")));

app.use("/api/transactions", transactionRouter);
app.use("/api/users", usersRouter);
app.use("/api/transactions-summary", transactionsSummaryRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;
