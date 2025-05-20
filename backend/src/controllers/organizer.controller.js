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
    const userId = req.user._id;

    const userFields = ['phoneNumber'];
    const organizerFields = ['bio',  'isVerified'];
    const futsalFields = ['name', 'location', 'description', 'ownerDescription', 'ownerName', 'openingHours', 'gamesOrganized', 'plusPoints', 'mapLink'];

    const userUpdates = {};
    const organizerUpdates = {};
    const futsalData = {};

    Object.keys(req.body).forEach(key => {
        if (userFields.includes(key)) userUpdates[key] = req.body[key];
        if (organizerFields.includes(key)) organizerUpdates[key] = req.body[key];
        if (futsalFields.includes(key)) futsalData[key] = req.body[key];
    });

    if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(userId, userUpdates);
    }

    // 3. Get or create OrganizerProfile
    let organizerProfile = await OrganizerProfile.findOne({ user: userId });
    if (!organizerProfile) {
        organizerProfile = new OrganizerProfile({ user: userId });
    }

    // 4. Update organizer fields
    Object.assign(organizerProfile, organizerUpdates);
    await organizerProfile.save();

    // 5. Create the futsal and attach to organizer
    const newFutsal = await Futsal.create({ ...futsalData, organizer: userId });
    organizerProfile.futsals.push(newFutsal._id);
    await organizerProfile.save();

    // 6. Return all linked data
    const user = await User.findById(userId).select('-password');
    const fullOrganizerProfile = await OrganizerProfile.findOne({ user: userId }).populate('futsals');

    return res.status(201).json(
        new ApiResponse(201, {
            user,
            organizerProfile: fullOrganizerProfile
        }, 'Futsal created and data stored in correct models')
    )
})


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

export {
    createFutsal,
    getFutsalsByOrganizer,
    updateFutsal,
    deleteFutsal,
    createTournament,
}