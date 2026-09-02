// config/db.js
//
// Centralized MongoDB connection. Previously the connection lived inline in
// server.js while an empty backend/config/config/db.js sat unused in the
// repo — that dead nested folder has been removed.

import mongoose from "mongoose";

export default async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Check your .env file.");
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected");
}