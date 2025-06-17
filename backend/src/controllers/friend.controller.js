import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Friendship } from "../models/friends.model.js";
import { Notification } from "../models/notification.model.js";
import { PlayerProfile } from "../models/playerprofile.model.js";

const sendFriendRequest = asyncHandler(async (req, res) => {
    const { recipientId } = req.body;
    const userId = req.user._id;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
        throw new ApiError(404, "Recipient user not found");
    }

    // Check if friend request already exists
    const existingRequest = await Friendship.findOne({
        $or: [
            { user: userId, friend: recipientId },
            { user: recipientId, friend: userId }
        ]
    });
    
    if (existingRequest) {
        throw new ApiError(400, "Friend request already exists or users are already friends");
    }
    
    // Create friend request
    const friendRequest = await Friendship.create({
        user: userId,
        friend: recipientId,
        status: "pending"
    });

    // Update recipient's player profile with the pending request
    await PlayerProfile.findOneAndUpdate(
        { user: recipientId },
        {
            $push: {
                pendingFriendRequests: {
                    user: userId,
                    status: "pending"
                }
            }
        }
    );

    // Create notification for recipient
    await Notification.create({
        recipient: recipientId,
        type: "FRIEND_REQUEST",
        title: "New Friend Request",
        message: `${req.user.username} sent you a friend request`,
        data: { senderId: userId }
    });

    return res.status(201).json(
        new ApiResponse(201, friendRequest, "Friend request sent successfully")
    );
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user._id;

    const friendRequest = await Friendship.findOne({
        _id: requestId,
        friend: userId,
        status: "pending"
    });
    
    if (!friendRequest) {
        throw new ApiError(404, "Friend request not found");
    }
    
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Update both users' player profiles
    await Promise.all([
        // Update recipient's profile
        PlayerProfile.findOneAndUpdate(
            { user: userId },
            {
                $push: { friends: friendRequest.user },
                $pull: { pendingFriendRequests: { user: friendRequest.user } }
            }
        ),
        // Update sender's profile
        PlayerProfile.findOneAndUpdate(
            { user: friendRequest.user },
            {
                $push: { friends: userId }
            }
        )
    ]);

    // Create notification for sender
    await Notification.create({
        recipient: friendRequest.user,
        type: "FRIEND_REQUEST_ACCEPTED",
        title: "Friend Request Accepted",
        message: `${req.user.username} accepted your friend request`,
        data: { friendId: userId }
    });

    return res.json(
        new ApiResponse(200, friendRequest, "Friend request accepted successfully")
    );
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user._id;

    const friendRequest = await Friendship.findOneAndDelete({
        _id: requestId,
        friend: userId,
        status: "pending"
    });
    
    if (!friendRequest) {
        throw new ApiError(404, "Friend request not found");
    }

    // Remove pending request from recipient's profile
    await PlayerProfile.findOneAndUpdate(
        { user: userId },
        {
            $pull: { pendingFriendRequests: { user: friendRequest.user } }
        }
    );

    return res.json(
        new ApiResponse(200, {}, "Friend request rejected successfully")
    );
});

const getFriendsList = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const playerProfile = await PlayerProfile.findOne({ user: userId })
        .populate('friends', 'username avatar');
        
    if (!playerProfile) {
        throw new ApiError(404, "Player profile not found");
    }

    const friendsList = playerProfile.friends.map(friend => ({
        friendId: friend._id,
        username: friend.username,
        avatar: friend.avatar,
        since: friend.createdAt
    }));

    return res.json(
        new ApiResponse(200, friendsList, "Friends list retrieved successfully")
    );
});

const getPendingRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const playerProfile = await PlayerProfile.findOne({ user: userId })
        .populate('pendingFriendRequests.user', 'username avatar');
        
    if (!playerProfile) {
        throw new ApiError(404, "Player profile not found");
    }

    const pendingRequests = playerProfile.pendingFriendRequests.map(request => ({
        _id: request._id,
        sender: request.user,
        status: request.status,
        createdAt: request.createdAt
    }));

    return res.json(
        new ApiResponse(200, pendingRequests, "Pending friend requests retrieved successfully")
    );
});

export {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendsList,
    getPendingRequests
};
