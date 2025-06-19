import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Slot } from '../models/slot.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Team requests a challenge for a slot
const requestTeamChallenge = asyncHandler(async (req, res) => {
    const { slotId } = req.params;
    const { challengerTeamId } = req.body;
    const slot = await Slot.findById(slotId);
    if (!slot) throw new ApiError(404, 'Slot not found');
    if (slot.challenge && slot.challenge.status === 'pending') {
        throw new ApiError(400, 'A challenge is already pending for this slot');
    }
    await slot.markAsTeamChallengePending(challengerTeamId);
    const updatedSlot = await Slot.findById(slotId);
    console.log('[DEBUG] Challenge created:', {
      slotId: updatedSlot._id,
      challenge: updatedSlot.challenge,
      status: updatedSlot.status,
      bookedOffline: updatedSlot.bookedOffline
    });
    return res.status(200).json(new ApiResponse(200, updatedSlot, 'Team challenge requested'));
});

// Opponent team accepts the challenge
const acceptTeamChallenge = asyncHandler(async (req, res) => {
    const { slotId } = req.params;
    const { opponentTeamId } = req.body;
    const slot = await Slot.findById(slotId);
    if (!slot) throw new ApiError(404, 'Slot not found');
    if (!slot.challenge || slot.challenge.status !== 'pending') {
        throw new ApiError(400, 'No pending challenge for this slot');
    }
    try {
        await slot.acceptTeamChallenge(opponentTeamId);
        return res.status(200).json(new ApiResponse(200, slot, 'Team challenge accepted. Slot is now team vs team.'));
    } catch (err) {
        throw new ApiError(400, err.message);
    }
});

// List all open challenges
const listOpenChallenges = asyncHandler(async (req, res) => {
    const openChallenges = await Slot.listOpenChallenges();
    console.log('[DEBUG] Open challenges returned:', openChallenges);
    return res.status(200).json(new ApiResponse(200, openChallenges, 'Open challenges fetched'));
});

// Join a challenge (opponent team joins, pays, and books slot)
const joinChallenge = asyncHandler(async (req, res) => {
    const { slotId } = req.params;
    const { opponentTeamId } = req.body;
    const slot = await Slot.findById(slotId);
    if (!slot) throw new ApiError(404, 'Slot not found');
    if (!slot.challenge || slot.challenge.status !== 'pending') {
        throw new ApiError(400, 'No pending challenge for this slot');
    }
    if (slot.challenge.opponent) {
        throw new ApiError(400, 'Challenge already joined by another team');
    }
    // Mark payment for opponent (simulate payment here)
    await slot.markChallengePayment('opponent');
    // Set opponent and accept challenge
    slot.challenge.opponent = opponentTeamId;
    slot.challenge.status = 'accepted';
    slot.challenge.acceptedAt = new Date();
    slot.status = 'booked';
    await slot.save();
    return res.status(200).json(new ApiResponse(200, slot, 'Challenge joined and slot booked for both teams'));
});

// Refund challenger if no one joins by deadline
const refundIfNoOpponent = asyncHandler(async (req, res) => {
    const { slotId } = req.params;
    const slot = await Slot.findById(slotId);
    if (!slot) throw new ApiError(404, 'Slot not found');
    const refunded = await slot.refundIfNoOpponent();
    if (refunded) {
        return res.status(200).json(new ApiResponse(200, slot, 'Refund processed for challenger'));
    } else {
        return res.status(400).json(new ApiResponse(400, slot, 'Refund not applicable'));
    }
});

export { requestTeamChallenge, acceptTeamChallenge, listOpenChallenges, joinChallenge, refundIfNoOpponent };
