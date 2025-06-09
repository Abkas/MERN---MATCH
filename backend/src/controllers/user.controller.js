import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import {PlayerProfile} from '../models/playerprofile.model.js'
import {OrganizerProfile} from '../models/organizerprofile.model.js'
import {Followers} from '../models/followers.model.js'
import mongoose from 'mongoose'
import { generateAccessToken } from '../utils/jwt-token.js' 
import bcrypt from 'bcrypt'
import { Slot } from '../models/slot.model.js'
import { Game } from '../models/game.model.js'

const signUpUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password,
      role,  
    });

    let profile;
    if (role === 'player') {
        profile = await PlayerProfile.create({ user: newUser._id })
        newUser.playerProfile = profile._id

    } else if (role === 'organizer') {
        profile = await OrganizerProfile.create({ user: newUser._id })
        newUser.organizerProfile = profile._id
    }

    if (newUser) {
      // generate jwt token here
      generateAccessToken(newUser._id,res)
      await newUser.save()
      res
     .status(201)
     .json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      })
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const registerUser = asyncHandler(async (req, res) => {
    const allowedFields = [
        'fullName', 'username', 'bio', 'preferences',
        'phoneNumber', 'availability', 'location', 'skillLevel'
    ]

    const updateFields = {}
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateFields[field] = req.body[field]
        }
    })

    if (req.files && req.files.avatar && req.files.avatar[0]) {
        const avatarLocalPath = req.files.avatar[0].path;
        const avatar = await uploadOnCloudinary(avatarLocalPath, 'avatars')
        if (!avatar || !avatar.url) {
            throw new ApiError(500, 'Failed to upload avatar')
        }
        updateFields.avatar = avatar.url
    }

    if (updateFields.username) {
        const existedUser = await User.findOne({
            username: updateFields.username,
            _id: { $ne: req.user._id }
        });
        if (existedUser) {
            throw new ApiError(409, 'User already exists with same username')
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateFields },
        { new: true }
    ).select('-password -refreshToken')

    if (!updatedUser) {
        throw new ApiError(500, 'User update failed')
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, 'User profile updated successfully'))
})

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('LOGIN REQUEST:', { email, password });

  try {
    const user = await User.findOne({ email }).populate('playerProfile').populate('organizerProfile')

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }


    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }else{
        console.log('Password is correct');
    }

    const accesstoken = generateAccessToken(user._id,res); // Make sure this returns a value!
    console.log('Access token:', accesstoken);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
        phoneNumber: user.phoneNumber,
      accesstoken,
      playerProfile: user.playerProfile, 
      organizerProfile: user.organizerProfile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    })

  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


const changeCurrentPassword = asyncHandler(async(req, res) =>{
    const{oldPassword, newPassword, confirmPassword} = req.body  

    if(!(newPassword == confirmPassword)){
        throw new ApiError(400, 'New password and confirm password do not match')
    }

    const user = await User.findById(req.user?._id) 
    if (!user) {
        throw new ApiError(404, 'User not found')
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,'Invalid password')
    }

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed sucessfully'))
})

const getCurrentUser = asyncHandler(async(req,res) =>{
    const user = await User.findById(req.user._id)
        .populate('playerProfile')
        .populate('organizerProfile')
        .select('-password')
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    // Return the same fields as loginUser
    return res
        .status(200)
        .json(new ApiResponse(200, {
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar:user.avatar,
            role: user.role,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            playerProfile: user.playerProfile,
            organizerProfile: user.organizerProfile,
            matchHistory: user.matchHistory, // <-- add this
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }, 'Current user fetched successfully'))
})

const updateAccountDetails = asyncHandler(async(req, res) =>{
    const userId = req.user._id
    const updateData = req.body

    const userFields = ['username', 'phoneNumber', 'avatar', 'fullName', 'email'];
    const playerFields = ['bio', 'skillLevel', 'location', 'preferences','availability','dateOfBirth'];
    const organizerFields = ['bio', 'location', 'futsals'];

    const userUpdate = {}
    const playerUpdate = {}
    const organizerUpdate = {}

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    for (const key in updateData) {
        if (userFields.includes(key)) {
            userUpdate[key] = updateData[key];
        } else if (user.role === 'player' && playerFields.includes(key)) {
            playerUpdate[key] = updateData[key];
        } else if (user.role === 'organizer' && organizerFields.includes(key)) {
            organizerUpdate[key] = updateData[key];
        }
    }

    if (user.role === 'player' && Object.keys(playerUpdate).length > 0 && user.playerProfile) {
        await PlayerProfile.findByIdAndUpdate(user.playerProfile, playerUpdate, { new: true });
    }

    if (user.role === 'organizer' && Object.keys(organizerUpdate).length > 0 && user.organizerProfile) {
        await OrganizerProfile.findByIdAndUpdate(user.organizerProfile, organizerUpdate, { new: true });
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId, 
        userUpdate, 
        { new: true }
    ).populate({
        path: 'playerProfile',
        populate: {
            path: 'reviews matchHistory followedFutsals'
        }
    }).populate('organizerProfile')
     .select('-password -refreshToken');

    if (!updatedUser) {
        throw new ApiError(500, 'Failed to update user data');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, 'Account details updated successfully'))
})

const updateUserAvatar = asyncHandler(async(req,res) =>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is missing')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar){
        throw ApiError(400, 'Error while uploading on avatar')
    }
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new:true}
    ).select('-password')

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Avatar updated successfully'))

})

const getUserProfileFollow = asyncHandler(async(req,res) =>{
    const {username } =req.params                   

    if(!username?.trim()){
        throw new ApiError(400, 'Username is missing')
    }

    const follow = await User.aggregate([
    {
        $match:{
            username: username?.toLowerCase()
        }
    },{
        $lookup :{
            from: 'followers',
            localField: '_id',
            foreignField: 'profile',
            as: 'profileFollowers'
        }
    },{
        $lookup:{
            from: 'followers',
            localField: '_id',
            foreignField: 'follower',
            as: 'profileFollowing'
        }
    },{
        $addFields:{
            followersCount :{
                $size: "$profileFollowers"
            },
            followingCount:{
                $size: '$profileFollowing'
            },
            isFollowing: {
                $cond: {
                    if: {$in:[req.user?._id, '$profileFollowers.follower']},
                    then: true,
                    else: false
                }
            }
        }
    },{
        $project:{
            fullName: 1,
            username : 1,
            followersCount:1,
            followingCount:1,
            isFollowing:1,
            avatar:1,
            email:1,
            role:1
        }
    }
    ])
    if(!follow?.length) {
        throw new ApiError(404, 'Follow does not exist')
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,follow[0], 'Userfollow fetched sucessfully')
    )

    console.log(follow)
})

const getGameHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },{
            $lookup :{
                from: 'games',
                localField: 'matchHistory',
                foreignField: '_id',
                as: 'matchHistory',
                pipeline:[
                    {
                        $lookup:{
                            from:'playerprofiles',
                            localField: 'players',
                            foreignField: '_id',
                            as:'players',
                            pipeline:[
                                {
                                    $project:{
                                        futsal:1,
                                        result:1,
                                        players:{
                                            _id:1,
                                        },                         
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            players:{
                                $first:'$players'
                            }
                        }
                    }
                ]
            }
        }

    ])

    if (!user || user.length === 0) {
        throw new ApiError(404, 'User not found or has no match history');
    }

    return res
    .status(200)
    .json(new ApiResponse(200, user[0].matchHistory, 'Match history fetched sucessfully'))
})

const checkAuth = asyncHandler(async(req,res) =>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
       console.log('Error in checkAuth:', error)
       res.status(500).json({ message: 'Internal server error' }) 
    }
})

const updateUserLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  const userId = req.user._id;

  if (!latitude || !longitude) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      location: {
        latitude,
        longitude,
        lastUpdated: new Date()
      }
    },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "Location updated successfully")
  );
});

const moveToHistory = asyncHandler(async(req, res) => {
    const { slotIds } = req.body;
    const userId = req.user._id;

    if (!slotIds || !Array.isArray(slotIds)) {
        throw new ApiError(400, 'Slot IDs are required and must be an array');
    }

    try {
        // Create game records for each slot
        const games = await Promise.all(slotIds.map(async (slotId) => {
            const slot = await Slot.findById(slotId).populate('futsal');
            if (!slot) {
                throw new ApiError(404, `Slot ${slotId} not found`);
            }

            // Create a new game record with 'completed' status instead of 'ended'
            const game = await Game.create({
                futsal: slot.futsal._id,
                slot: slotId,
                players: slot.players,
                status: 'ended',
                time: slot.time,
                date: slot.date
            });

            return game;
        }));

        // Add games to user's match history
        const user = await User.findByIdAndUpdate(
            userId,
            { $push: { matchHistory: { $each: games.map(game => game._id) } } },
            { new: true }
        );

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { games }, 'Matches moved to history successfully'));
    } catch (error) {
        console.error('Error in moveToHistory:', error);
        throw new ApiError(500, error.message || 'Failed to move matches to history');
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    getUserProfileFollow,
    getGameHistory,
    signUpUser,
    checkAuth,
    updateUserLocation,
    moveToHistory
}