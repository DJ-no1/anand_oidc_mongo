import mongoose from "mongoose";

const connectDB = async () => {
  // If the connection string does not include a database name, prefer an explicit env var.
  // This prevents connecting to the default `test` DB (which may contain stray indexes).
  const dbName = process.env.MONGODB_DB || process.env.DB_NAME || "bmc_clone";

  const conn = await mongoose.connect(process.env.MONGODB_URI, { dbName });
  console.log(
    `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`,
  );
};

export default connectDB;
