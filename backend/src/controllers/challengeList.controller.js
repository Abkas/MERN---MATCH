import { asyncHandler } from '../utils/asyncHandler.js';
import { Slot } from '../models/slot.model.js';
import { Futsal } from '../models/futsal.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get all futsals (for challenge creation step 1)
const getAllFutsals = asyncHandler(async (req, res) => {
    const futsals = await Futsal.find({}, 'name location');
    return res.status(200).json(new ApiResponse(200, futsals, 'Futsals fetched'));
});

// Get eligible slots for a futsal (for challenge creation step 2)
const getEligibleSlotsForChallenge = asyncHandler(async (req, res) => {
    const { futsalId } = req.params;
    const now = new Date();
    const slots = await Slot.find({
        futsal: futsalId,
        status: 'available',
        bookedOffline: false,
        $or: [
            { 'challenge.status': { $exists: false } },
            { 'challenge.status': null },
            { 'challenge.status': { $nin: ['pending', 'accepted'] } }
        ]
    })
    .lean();
    // Filter slots: not more than 60% filled and upcoming
    const eligible = slots.filter(slot => {
        const fill = slot.players.length / slot.maxPlayers;
        const slotDate = new Date(slot.date + 'T' + slot.time.split('-')[0] + ':00');
        return fill < 0.6 && slotDate > now;
    });
    return res.status(200).json(new ApiResponse(200, eligible, 'Eligible slots fetched'));
});

export { getAllFutsals, getEligibleSlotsForChallenge };
