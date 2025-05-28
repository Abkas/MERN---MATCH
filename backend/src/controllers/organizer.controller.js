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

// GET /organizer/profile
const getOrganizerProfile = asyncHandler(async (req, res) => {
    console.log('getOrganizerProfile called'); // Debug: confirm route is hit
    // If user is authenticated, use req.user._id; else, fallback to query param for demo/testing
    let userId = req.user?._id || req.query.userId;
    if (!userId) {
        // fallback to demo
        const demoProfile = {
            name: 'Demo Organizer',
            avatar: '/default-owner.png',
            email: 'demo.organizer@example.com',
            phone: '+1234567890',
            organizerProfile: {
                bio: 'This is a demo bio for the organizer. Showcase your experience and achievements here.',
                additionalInfo: 'Demo additional info about the organizer.',
                awards: 'Best Organizer 2024',
                isVerified: true,
                futsals: [],
                tournaments: []
            }
        };
        return res.status(200).json(new ApiResponse(200, demoProfile, 'Organizer profile blueprint'));
    }

    // Fetch user and organizer profile from DB
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    const organizerProfile = await OrganizerProfile.findOne({ user: userId })
        .populate({
            path: 'futsals',
            populate: { path: 'slots tournaments reviews followers' }
        });
    if (!organizerProfile) {
        throw new ApiError(404, 'Organizer profile not found');
    }
    // Compose response with user and organizer profile fields
    const response = {
        name: user.fullName || user.username,
        avatar: user.avatar || '/default-owner.png',
        email: user.email,
        phone: user.phoneNumber,
        organizerProfile: {
            bio: organizerProfile.bio,
            additionalInfo: organizerProfile.additionalInfo,
            awards: organizerProfile.awards,
            isVerified: organizerProfile.isVerified,
            futsals: organizerProfile.futsals,
            // Optionally, add tournaments if you have them
        }
    };
    console.log('Organizer profile response:', JSON.stringify(response, null, 2));
    return res.status(200).json(new ApiResponse(200, response, 'Organizer profile fetched from DB'));
});

export {
    createFutsal,
    getFutsalsByOrganizer,
    updateFutsal,
    deleteFutsal,
    createTournament,
    getOrganizerProfile
};