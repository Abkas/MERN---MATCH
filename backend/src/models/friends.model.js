import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    friend: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

// Compound index to ensure unique friendships
friendshipSchema.index({ user: 1, friend: 1 }, { unique: true });

export const Friendship = mongoose.model("Friendship", friendshipSchema);
