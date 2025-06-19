import { asyncHandler } from '../utils/asyncHandler.js';
import { Slot } from '../models/slot.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get slots for a futsal and date where at least one player has joined and slot is not full
const getBookedButOpenSlots = asyncHandler(async (req, res) => {
  const { futsalId } = req.params;
  const { date } = req.query;
  if (!futsalId || !date) {
    return res.status(400).json({ success: false, message: 'futsalId and date required' });
  }
  // Find slots for futsal/date, at least one player, and status 'available'
  const slots = await Slot.find({
    futsal: futsalId,
    date,
    status: 'available',
    $expr: { $gt: [ { $size: '$players' }, 0 ] }
  });
  return res.json(new ApiResponse(200, slots, 'Slots with bookings and open spots'));
});

export { getBookedButOpenSlots };
