import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/keys-scanner";

export async function connectDB() {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully to DB");
}

// --- Schemas ---
const ProgressSchema = new mongoose.Schema({
    repo: { type: String, required: true, unique: true },
    lastCommit: { type: String, required: true },
    lastPage: { type: Number, required: true, default: 1 },
});

const FindingSchema = new mongoose.Schema({
    repo: String,
    commitSha: String,
    file: String,
    type: String,
    value: String,
    createdAt: { type: Date, default: Date.now },
});

export const Progress = mongoose.model("Progress", ProgressSchema);
export const Finding = mongoose.model("Finding", FindingSchema);
