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
    updateSlotsPrice,
    checkAndGenerateNextDaySlots,
    updateSlotStatus
} from '../controllers/slot.controller.js';
import { getBookedButOpenSlots } from '../controllers/slot.special.controller.js';

const router = Router();

// Protected routes - require authentication
router.use(verifyJWT);

// Player-specific routes (put these first to avoid conflicts with parameterized routes)
router.get('/player/slots', getPlayerJoinedSlots);
router.delete('/:slotId/cancel', cancelSlotBooking);

// Futsal-specific routes
router.post('/:futsalId/slots', createSlot);
router.patch('/:futsalId/slots/:slotId', updateSlot);
router.get('/:futsalId/slots', checkAndGenerateNextDaySlots, getSlotsByFutsal);
router.post('/:futsalId/slots/:slotId/join', joinSlot);
router.delete('/:futsalId/slots/:slotId', deleteSlot);
router.get('/:futsalId/slots/date', checkAndGenerateNextDaySlots, getSlotsByDate);
router.post('/:futsalId/slots/add', addSlot);
router.post('/:futsalId/slots/reset', resetSlots);
router.patch('/:futsalId/update-slots-price', updateSlotsPrice);
router.patch('/:futsalId/slots/:slotId/status', updateSlotStatus);

// Special: slots with bookings but still open
router.get('/:futsalId/slots/booked-open', getBookedButOpenSlots);

export default router;