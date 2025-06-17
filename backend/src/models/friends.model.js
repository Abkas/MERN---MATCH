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

// Method to handle pending friend requests
friendshipSchema.statics.findPendingRequests = async function(userId) {
    return this.find({
        friend: userId,
        status: 'pending'
    }).populate('user', 'username avatar');
};

// Method to check if friend request exists
friendshipSchema.statics.checkExistingRequest = async function(userId, friendId) {
    return this.findOne({
        $or: [
            { user: userId, friend: friendId },
            { user: friendId, friend: userId }
        ]
    });
};

export const Friendship = mongoose.model("Friendship", friendshipSchema);
