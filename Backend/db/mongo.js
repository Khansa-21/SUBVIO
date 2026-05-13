import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

if (!DB_URI) {
  throw new Error(
    "plz define the mongodb uri environment varaiable in .env.local file"
  );
}

// Connect to DB
const connectDb = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log(`Successfully! connected to database in ${NODE_ENV} mode`);
  } catch (err) {
    console.error("Error connecting the database", err);
    process.exit(1);
  }
};

export default connectDb;
