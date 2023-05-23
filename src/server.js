import mongoose from "mongoose";
import app from "./app.js";
import { config } from "./config.js";

const db = mongoose.connection;
const PORT = 3000;

app.listen(PORT, async () => {
  console.log("Connecting to database");
  await mongoose.connect(config.MONGODB_URI);
});

db.on("error", (error) => {
  console.error("Database connection error", error);
  process.exit(1);
});
db.once("open", () => {
  console.log("Connected to database");
});
process.on("SIGINT", () => {
  mongoose.disconnect();
  console.log("Connection closed due to app termination");
});
