import * as mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri: string = process.env.MONGO_URI || "mongodb://localhost:27017/keys-scanner-app";

export const connect = async () => {
    try {
        // Connect to db
        await mongoose.connect(uri);
    } catch (e) {
        console.error("Error connecting to db: ", e)
        process.exit(1)
    }
};
