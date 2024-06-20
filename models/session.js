import mongoose from "../db.js";

// Define model for session store
export default mongoose.model(
    "Session",
    new mongoose.Schema({
        id: String,
        expiration: Number,
        data: Object
    })
);
