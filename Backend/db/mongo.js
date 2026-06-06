import dns from "node:dns";
import mongoose from "mongoose";
import { DB_URI, DNS_SERVERS, NODE_ENV } from "../config/env.js";

if (!DB_URI) {
  throw new Error(
    "plz define the mongodb uri environment varaiable in .env.local file"
  );
}

if (DNS_SERVERS) {
  const servers = DNS_SERVERS.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length > 0) {
    dns.setServers(servers);
  }
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
