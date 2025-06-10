import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    createSlot,
    updateSlot,
    getSlotsByFutsal,
    joinSlot,
    deleteSlot,
    getSlotsByDate,
    addSlot,
    resetSlots,
    getPlayerJoinedSlots,
    cancelSlotBooking,
    updateSlotsPrice
} from '../controllers/slot.controller.js';

const router = Router();

// Protected routes - require authentication
router.use(verifyJWT);

// Create a new slot
router.post('/:futsalId/slots', createSlot);

// Update a slot
router.patch('/:futsalId/slots/:slotId', updateSlot);

// Get slots by futsal
router.get('/:futsalId/slots', getSlotsByFutsal);

// Join a slot
router.post('/:futsalId/slots/:slotId/join', joinSlot);

// Delete a slot
router.delete('/:futsalId/slots/:slotId', deleteSlot);

// Get slots by date
router.get('/:futsalId/slots/date', getSlotsByDate);

// Add a new slot
router.post('/:futsalId/slots/add', addSlot);

// Reset slots
router.post('/:futsalId/slots/reset', resetSlots);

// Get player's joined slots
router.get('/player/slots', getPlayerJoinedSlots);

// Cancel slot booking
router.delete('/slots/:slotId/cancel', cancelSlotBooking);

// Update price for all slots on a date
router.patch('/:futsalId/update-slots-price', updateSlotsPrice);

export default router; 