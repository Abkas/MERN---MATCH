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

// Player-specific routes (put these first to avoid conflicts with parameterized routes)
router.get('/player/slots', getPlayerJoinedSlots);
router.delete('/:slotId/cancel', cancelSlotBooking);

// Futsal-specific routes
router.post('/:futsalId/slots', createSlot);
router.patch('/:futsalId/slots/:slotId', updateSlot);
router.get('/:futsalId/slots', getSlotsByFutsal);
router.post('/:futsalId/slots/:slotId/join', joinSlot);
router.delete('/:futsalId/slots/:slotId', deleteSlot);
router.get('/:futsalId/slots/date', getSlotsByDate);
router.post('/:futsalId/slots/add', addSlot);
router.post('/:futsalId/slots/reset', resetSlots);
router.patch('/:futsalId/update-slots-price', updateSlotsPrice);

export default router; 