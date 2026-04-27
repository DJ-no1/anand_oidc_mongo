/**
 * One-off: set a user's role to "admin" so /admin UI and /api/admin/* work.
 * Auth middleware loads role from Mongo on each request (JWT is only used for user id).
 *
 * Usage (from backend/):
 *   pnpm run promote:admin -- you@example.com
 */
import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../src/common/config/db.js";
import User from "../src/modules/auth/auth.model.js";

const emailArg = process.argv[2];
if (!emailArg?.trim()) {
  console.error("Usage: pnpm run promote:admin -- <email>");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();

await connectDB();

const user = await User.findOne({ email });
if (!user) {
  console.error(`No user found with email: ${email}`);
  await mongoose.disconnect();
  process.exit(1);
}

const before = user.role;
user.role = "admin";
await user.save();

console.log(`Updated ${email}: role "${before}" → "admin"`);
await mongoose.disconnect();
