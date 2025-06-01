import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { PlayerProfile } from '../models/playerprofile.model.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// GET /player/profile
const getPlayerProfile = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json(new ApiResponse(401, {}, 'Unauthorized: No user found in request'));
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
        return res.status(404).json(new ApiResponse(404, {}, 'User not found'));
    }
    const playerProfile = await PlayerProfile.findOne({ user: userId });
    const responseData = {
        user: user ? user.toObject() : {},
        playerProfile: playerProfile ? playerProfile.toObject() : {}
    };
    // Debug: log the response data
    console.log('DEBUG: getPlayerProfile response:', responseData);
    return res.status(200).json(new ApiResponse(200, responseData, 'Player profile (all raw data, frontend merges with blueprint)'));
});

// PATCH /player/update-profile
const updatePlayerProfile = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json(new ApiResponse(401, {}, 'Unauthorized: No user found in request'));
    }

    // Handle avatar upload if present
    let avatarUrl;
    if (req.file) {
        avatarUrl = await uploadOnCloudinary(req.file.path);
        if (!avatarUrl || !avatarUrl.url) {
            return res.status(500).json(new ApiResponse(500, 'Failed to upload avatar image', {}));
        }
    }

    // Update User fields
    const userUpdates = {};
    if (req.body.username) userUpdates.username = req.body.username;
    if (req.body.fullName) userUpdates.fullName = req.body.fullName;
    if (req.body.email) userUpdates.email = req.body.email;
    if (req.body.phoneNumber) userUpdates.phoneNumber = req.body.phoneNumber;
    if (avatarUrl && avatarUrl.url) userUpdates.avatar = avatarUrl.url;

    if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(userId, userUpdates);
    }

    // Update PlayerProfile fields
    const playerUpdates = {};
    if (req.body.bio) playerUpdates.bio = req.body.bio;
    if (req.body.skillLevel) playerUpdates.skillLevel = req.body.skillLevel;
    if (req.body.location) playerUpdates.location = req.body.location;
    if (req.body.preferences) playerUpdates.preferences = req.body.preferences;
    if (req.body.availability) playerUpdates.availability = req.body.availability;
    if (req.body.dateOfBirth) playerUpdates.dateOfBirth = req.body.dateOfBirth;

    let playerProfile = await PlayerProfile.findOne({ user: userId });
    if (!playerProfile) {
        playerProfile = new PlayerProfile({ user: userId });
    }
    Object.assign(playerProfile, playerUpdates);
    await playerProfile.save();

    // Return updated data
    const user = await User.findById(userId).select('-password');
    const updatedPlayerProfile = await PlayerProfile.findOne({ user: userId });

    return res.status(200).json(
        new ApiResponse(200, 'Player profile updated successfully', { user, playerProfile: updatedPlayerProfile })
    );
});

export {
    getPlayerProfile,
    updatePlayerProfile
};
