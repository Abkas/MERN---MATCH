import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Friendship } from "../models/friends.model.js";
import { Notification } from "../models/notification.model.js";
import { PlayerProfile } from "../models/playerprofile.model.js";

const sendFriendRequest = asyncHandler(async (req, res) => {
    const { recipientId } = req.body;
    const userId = req.user?._id;

    // Input validation
    if (!recipientId) {
        throw new ApiError(400, "Recipient ID is required");
    }

    if (!userId) {
        throw new ApiError(401, "Authentication required");
    }

    // Log request details for debugging
    console.log('Friend Request Details:', {
        senderId: userId,
        senderUsername: req.user?.username,
        recipientId,
        timestamp: new Date().toISOString()
    });

    // Prevent sending request to self
    if (userId.toString() === recipientId.toString()) {
        throw new ApiError(400, "Cannot send friend request to yourself");
    }

    try {
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
        });            if (existingRequest) {
                throw new ApiError(400, "Friend request already exists or users are already friends");
            }

            // Create friend request
            const friendRequest = await Friendship.create({
                user: userId,
                friend: recipientId,
                status: "pending"
            });

            // Update recipient's player profile
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

            // Create notification
            const notification = await Notification.create({
                user: userId,
                recipient: recipientId,
                type: "FRIEND_REQUEST",
                title: "New Friend Request",
                message: `${req.user.username} sent you a friend request`
            });

            console.log('=== Friend Request Created ===');
            console.log('Request:', {
                id: friendRequest._id,
                from: userId,
                to: recipientId,
                status: friendRequest.status
            });
            console.log('Notification:', notification);

            return res.json(
                new ApiResponse(201, friendRequest, "Friend request sent successfully")
            );
    } catch (error) {
        console.error('Error in friend request:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Failed to send friend request: ${error.message}`);
    }
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
    ]);    // Create notification for sender
    await Notification.create({
        user: userId,
        recipient: friendRequest.user,
        type: "FRIEND_REQUEST_ACCEPTED",
        title: "Friend Request Accepted",
        message: `${req.user.username} accepted your friend request`
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

const getSentRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const sentRequests = await Friendship.find({
        user: userId,
        status: "pending"
    }).populate('friend', 'username avatar role');
    
    const formattedRequests = sentRequests.map(request => ({
        _id: request._id,
        recipient: request.friend,
        status: request.status,
        createdAt: request.createdAt
    }));

    return res.json(
        new ApiResponse(200, formattedRequests, "Sent friend requests retrieved successfully")
    );
});

const cancelFriendRequest = asyncHandler(async (req, res) => {
    const { recipientId } = req.params;
    const userId = req.user._id;

    const request = await Friendship.findOneAndDelete({
        user: userId,
        friend: recipientId,
        status: "pending"
    });
    
    if (!request) {
        throw new ApiError(404, "Friend request not found");
    }

    // Remove the pending request from recipient's profile
    await PlayerProfile.findOneAndUpdate(
        { user: recipientId },
        {
            $pull: { pendingFriendRequests: { user: userId } }
        }
    );

    return res.json(
        new ApiResponse(200, {}, "Friend request cancelled successfully")
    );
});

const getAllFriendships = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    console.log('=== getAllFriendships Debug ===');
    console.log('Current user ID:', userId);

    try {
        // Find all friendships where the current user is either the user or friend
        const friendships = await Friendship.find({
            $or: [
                { user: userId },
                { friend: userId }
            ]
        })
        .populate('user', 'username fullName avatar role')  // Include fullName
        .populate('friend', 'username fullName avatar role')  // Include fullName
        .lean();  // Convert to plain JS objects

        console.log('=== Found Friendships ===');
        console.log('Total friendships:', friendships.length);
        
        friendships.forEach(f => {
            console.log({
                id: f._id,
                user: {
                    id: f.user?._id?.toString(),
                    username: f.user?.username,
                    role: f.user?.role
                },
                friend: {
                    id: f.friend?._id?.toString(),
                    username: f.friend?.username,
                    role: f.friend?.role
                },
                status: f.status,
                isUserSender: f.user?._id?.toString() === userId.toString(),
                isUserReceiver: f.friend?._id?.toString() === userId.toString()
            });
        });

        // Group friendships by status for logging
        const pending = friendships.filter(f => f.status === 'pending');
        const accepted = friendships.filter(f => f.status === 'accepted');
        const pendingSent = pending.filter(f => 
            f.user._id.toString() === userId.toString()
        );
        const pendingReceived = pending.filter(f => 
            f.friend._id.toString() === userId.toString()
        );

        console.log('=== Friendship Stats ===');
        console.log(`Total Friendships: ${friendships.length}`);
        console.log(`- Accepted: ${accepted.length}`);
        console.log(`- Pending Sent: ${pendingSent.length}`);
        console.log(`- Pending Received: ${pendingReceived.length}`);

        return res.json(
            new ApiResponse(200, friendships, "All friendships retrieved successfully")
        );
    } catch (error) {
        console.error('Error fetching all friendships:', error);
        throw new ApiError(500, "Failed to fetch friendships");
    }
});

export {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendsList,
    getPendingRequests,
    getSentRequests,
    cancelFriendRequest,
    getAllFriendships
};
