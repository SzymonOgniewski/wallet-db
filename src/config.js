import dotenv from "dotenv";

dotenv.config();

export const config = {
  MONGODB_URI: process.env.MONGODB_URI,
  SECRET: process.env.SECRET,
  SEND_GRID_PASSWORD: process.env.SEND_GRID_PASSWORD,
};
