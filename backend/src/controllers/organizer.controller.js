import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { Futsal } from '../models/futsal.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Tournament } from '../models/tournament.model.js'
import mongoose from 'mongoose'
import { OrganizerProfile } from '../models/organizerprofile.model.js'
import { User } from '../models/user.model.js'
import {Slot} from '../models/slot.model.js'


const createFutsal = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Creating futsal for user:', userId);

        const userFields = ['phoneNumber'];
        const organizerFields = ['bio',  'isVerified'];
        const futsalFields = ['name', 'location', 'description', 'ownerDescription', 'ownerName', 'openingHours','futsalPhoto', 'gamesOrganized', 'plusPoints', 'mapLink'];

        const userUpdates = {};
        const organizerUpdates = {};
        const futsalData = {};

        Object.keys(req.body).forEach(key => {
            if (userFields.includes(key)) userUpdates[key] = req.body[key];
            if (organizerFields.includes(key)) organizerUpdates[key] = req.body[key];
            if (futsalFields.includes(key)) futsalData[key] = req.body[key];
        });

        console.log('Futsal data:', futsalData);

        if (Object.keys(userUpdates).length > 0) {
            await User.findByIdAndUpdate(userId, userUpdates);
        }

        // Get or create OrganizerProfile
        let organizerProfile = await OrganizerProfile.findOne({ user: userId });
        if (!organizerProfile) {
            console.log('Creating new organizer profile');
            organizerProfile = new OrganizerProfile({ user: userId });
        }

        // Update organizer fields
        Object.assign(organizerProfile, organizerUpdates);
        await organizerProfile.save();
        console.log('Organizer profile saved');

        // Create the futsal
        console.log('Creating new futsal');
        const newFutsal = await Futsal.create({ 
            ...futsalData, 
            organizer: userId,
            price: futsalData.price || 500 // Ensure price is set
        });
        console.log('Futsal created:', newFutsal._id);
        
        // Generate default slots
        console.log('Generating default slots');
        const defaultSlots = await Slot.generateDefaultSlots(newFutsal._id);
        console.log('Generated slots:', defaultSlots.length);
        
        // Insert slots
        console.log('Inserting slots');
        const slots = await Slot.insertMany(defaultSlots);
        console.log('Slots inserted:', slots.length);
        
        // Update futsal with slot references
        newFutsal.slots = slots.map(slot => slot._id);
        await newFutsal.save();
        console.log('Futsal updated with slots');

        // Update organizer profile
        organizerProfile.futsals.push(newFutsal._id);
        await organizerProfile.save();
        console.log('Organizer profile updated with futsal');

        // Return all linked data
        const user = await User.findById(userId).select('-password');
        const fullOrganizerProfile = await OrganizerProfile.findOne({ user: userId })
            .populate({
                path: 'futsals',
                populate: {
                    path: 'slots'
                }
            });

        return res.status(201).json(
            new ApiResponse(201, {
                user,
                organizerProfile: fullOrganizerProfile
            }, 'Futsal created and data stored in correct models')
        );
    } catch (error) {
        console.error('Error in createFutsal:', error);
        throw new ApiError(500, `Error creating futsal: ${error.message}`);
    }
});


const getFutsalsByOrganizer = asyncHandler(async (req, res) => {
    const futsals = await Futsal.find({ organizer: req.user._id })
        .populate('organizer')
        .populate('OrganizerProfile')
        .populate('tournaments')
        .populate('slots')

    if (!futsals || futsals.length === 0) {
        throw new ApiError(404, 'No futsals found for this organizer');
    }
    return res
        .status(200)
        .json(new ApiResponse(200, futsals, 'Futsals fetched successfully'));
})


 const updateFutsal = asyncHandler(async (req, res) => {
    const { id } = req.params
    const updates = req.body

    const updatedFutsal = await Futsal.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
    );

    if (!updatedFutsal) {
        throw new ApiError(404, 'Futsal not found')
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedFutsal, 'Futsal updated successfully'))
})

 const deleteFutsal = asyncHandler(async (req, res) => {
    const { id } = req.params

    const deletedFutsal = await Futsal.findByIdAndDelete(id)

    if (!deletedFutsal) {
        throw new ApiError(404, 'Futsal not found')
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Futsal deleted successfully'))
})

 const createTournament = asyncHandler(async (req, res) => {
    const { name, startDate, endDate, prizes, rules, format, registrationFee,
        venue } = req.body

    if (!name || !startDate || !endDate) {
        throw new ApiError(400, 'Name, start date, and end date are required')
    }

    const newTournament = await Tournament.create({
        name,
        organizer: req.user._id,
        startDate,
        endDate,
        prizes,
        rules,
        format,
        registrationFee,
        venue,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newTournament, 'Tournament created successfully'))
})

 // Get organizer profile by user id
const getOrganizerProfileById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const organizerProfile = await OrganizerProfile.findOne({ user: id })
        .populate({
            path: 'futsals',
            populate: { path: 'slots' }
        });
    if (!organizerProfile) {
        throw new ApiError(404, 'Organizer profile not found');
    }
    return res.status(200).json(new ApiResponse(200, organizerProfile, 'Organizer profile fetched successfully'));
});

// Get current organizer profile (from JWT)
const getCurrentOrganizerProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const organizerProfile = await OrganizerProfile.findOne({ user: userId })
        .populate({
            path: 'futsals',
            populate: { path: 'slots' }
        });
    if (!organizerProfile) {
        throw new ApiError(404, 'Organizer profile not found');
    }
    return res.status(200).json(new ApiResponse(200, organizerProfile, 'Current organizer profile fetched successfully'));
});

// PATCH /api/v1/organizer/profile
const updateOrganizerProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { name, phone, email, bio, additionalInfo, awards } = req.body;

    // Handle avatar upload (update User.avatar)
    let avatar;
    if (req.file) {
        avatar = req.file.path || req.file.location;
    }

    // Update User fields if provided
    const userUpdates = {};
    if (name) userUpdates.name = name;
    if (phone) userUpdates.phone = phone;
    if (email) userUpdates.email = email;
    if (avatar) userUpdates.avatar = avatar;
    if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(userId, userUpdates);
    }

    // Update OrganizerProfile fields if provided
    let organizerProfile = await OrganizerProfile.findOne({ user: userId });
    if (!organizerProfile) {
        organizerProfile = new OrganizerProfile({ user: userId });
    }
    if (bio !== undefined) organizerProfile.bio = bio;
    if (additionalInfo !== undefined) organizerProfile.additionalInfo = additionalInfo;
    if (awards !== undefined) organizerProfile.awards = awards;
    await organizerProfile.save();

    return res.status(200).json(new ApiResponse(200, organizerProfile, 'Organizer profile updated successfully'));
});

// PATCH /api/v1/organizer/profile/:id
const updateOrganizerProfileById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, phone, email, bio, additionalInfo, awards } = req.body;

    // Handle avatar upload (update User.avatar)
    let avatar;
    if (req.file) {
        avatar = req.file.path || req.file.location;
    }

    // Update User fields if provided
    const userUpdates = {};
    if (name) userUpdates.name = name;
    if (phone) userUpdates.phone = phone;
    if (email) userUpdates.email = email;
    if (avatar) userUpdates.avatar = avatar;
    if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(id, userUpdates);
    }

    // Update OrganizerProfile fields if provided
    let organizerProfile = await OrganizerProfile.findOne({ user: id });
    if (!organizerProfile) {
        organizerProfile = new OrganizerProfile({ user: id });
    }
    if (bio !== undefined) organizerProfile.bio = bio;
    if (additionalInfo !== undefined) organizerProfile.additionalInfo = additionalInfo;
    if (awards !== undefined) organizerProfile.awards = awards;
    await organizerProfile.save();

    return res.status(200).json(new ApiResponse(200, organizerProfile, 'Organizer profile updated successfully'));
});

export {
    createFutsal,
    getFutsalsByOrganizer,
    updateFutsal,
    deleteFutsal,
    createTournament,
    getOrganizerProfileById,
    getCurrentOrganizerProfile,
    updateOrganizerProfile,
    updateOrganizerProfileById,
};