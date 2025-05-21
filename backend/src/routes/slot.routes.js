import { Router } from 'express';
import {
    getSlotsByDate,
    updateSlot,
    deleteSlot,
    addSlot,
    joinSlot,
    resetSlots,
    getPlayerJoinedSlots,
    cancelSlotBooking
} from '../controllers/slot.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected routes - require authentication
router.use(verifyJWT);

// Get slots for a specific date
router.get('/:futsalId/slots', getSlotsByDate);

// Get slots joined by the current player
router.get('/player/joined', getPlayerJoinedSlots);

// Cancel a slot booking
router.delete('/:slotId/cancel', cancelSlotBooking);

// Add a new slot
router.post('/:futsalId/slots', addSlot);

// Update a slot
router.patch('/:futsalId/slots/:slotId', updateSlot);

// Delete a slot
router.delete('/:futsalId/slots/:slotId', deleteSlot);

// Join a slot
router.post('/:futsalId/slots/:slotId/join', joinSlot);

// Reset slots for a date
router.post('/:futsalId/slots/reset', resetSlots);

export default router; 