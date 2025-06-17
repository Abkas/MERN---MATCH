import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Friendship } from "../models/friendship.model.js";

// Send friend request
const sendFriendRequest = asyncHandler(async (req, res) => {
    const { recipientId } = req.body;
    const requesterId = req.user._id;

    // Check if users exist
    const [requester, recipient] = await Promise.all([
        User.findById(requesterId),
        User.findById(recipientId)
    ]);

    if (!recipient || !requester) {
        throw new ApiError(404, "User not found");
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
        $or: [
            { requester: requesterId, recipient: recipientId },
            { requester: recipientId, recipient: requesterId }
        ]
    });

    if (existingFriendship) {
        throw new ApiError(400, "Friendship request already exists");
    }

    // Create new friendship
    const friendship = await Friendship.create({
        requester: requesterId,
        recipient: recipientId
    });

    // Add friendship to both users
    await Promise.all([
        User.findByIdAndUpdate(requesterId, { $push: { friendships: friendship._id } }),
        User.findByIdAndUpdate(recipientId, { $push: { friendships: friendship._id } })
    ]);

    return res.status(200).json(
        new ApiResponse(200, friendship, "Friend request sent successfully")
    );
});

// Accept friend request
const acceptFriendRequest = asyncHandler(async (req, res) => {
    const { friendshipId } = req.body;
    const userId = req.user._id;

    const friendship = await Friendship.findById(friendshipId);

    if (!friendship) {
        throw new ApiError(404, "Friend request not found");
    }

    if (friendship.recipient.toString() !== userId.toString()) {
        throw new ApiError(403, "Not authorized to accept this request");
    }

    if (friendship.status !== "pending") {
        throw new ApiError(400, "Friend request is not pending");
    }

    friendship.status = "accepted";
    friendship.updatedAt = Date.now();
    await friendship.save();

    return res.status(200).json(
        new ApiResponse(200, friendship, "Friend request accepted successfully")
    );
});

// Reject/Cancel friend request
const rejectFriendRequest = asyncHandler(async (req, res) => {
    const { friendshipId } = req.body;
    const userId = req.user._id;

    const friendship = await Friendship.findById(friendshipId);

    if (!friendship) {
        throw new ApiError(404, "Friend request not found");
    }

    // Allow both recipient to reject or requester to cancel
    if (friendship.recipient.toString() !== userId.toString() && 
        friendship.requester.toString() !== userId.toString()) {
        throw new ApiError(403, "Not authorized to modify this request");
    }

    if (friendship.status !== "pending") {
        throw new ApiError(400, "Friend request is not pending");
    }

    // Remove friendship from both users
    await Promise.all([
        User.findByIdAndUpdate(friendship.requester, { $pull: { friendships: friendshipId } }),
        User.findByIdAndUpdate(friendship.recipient, { $pull: { friendships: friendshipId } })
    ]);

    // Delete the friendship
    await Friendship.findByIdAndDelete(friendshipId);

    return res.status(200).json(
        new ApiResponse(200, null, "Friend request removed successfully")
    );
});

// Get all friends
const getAllFriends = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
        path: 'friendships',
        populate: [
            { path: 'requester', select: 'username fullName avatar role' },
            { path: 'recipient', select: 'username fullName avatar role' }
        ]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Filter accepted friendships and format the response
    const friends = user.friendships
        .filter(f => f.status === 'accepted')
        .map(f => {
            // Return the other user in the friendship
            const friend = f.requester._id.toString() === userId.toString() 
                ? f.recipient 
                : f.requester;
            return {
                friendshipId: f._id,
                ...friend.toObject()
            };
        });

    return res.status(200).json(
        new ApiResponse(200, friends, "Friends fetched successfully")
    );
});

// Get pending requests (both sent and received)
const getPendingRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const friendships = await Friendship.find({
        $or: [{ requester: userId }, { recipient: userId }],
        status: 'pending'
    }).populate('requester recipient', 'username fullName avatar role');

    const [sent, received] = friendships.reduce(
        ([s, r], friendship) => {
            if (friendship.requester._id.toString() === userId.toString()) {
                s.push(friendship);
            } else {
                r.push(friendship);
            }
            return [s, r];
        },
        [[], []]
    );

    return res.status(200).json(
        new ApiResponse(200, { sent, received }, "Pending requests fetched successfully")
    );
});

export {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getAllFriends,
    getPendingRequests
};
