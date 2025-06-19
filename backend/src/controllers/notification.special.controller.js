import { asyncHandler } from '../utils/asyncHandler.js';
import { Slot } from '../models/slot.model.js';
import { User } from '../models/user.model.js';
import { createNotification } from './notification.controller.js';

// POST /notifications/ping-futsal
// req.body: { slotId, futsalId, message, senderId }
const pingFutsalParticipants = asyncHandler(async (req, res) => {
  const { slotId, futsalId, message, senderId } = req.body;
  if (!slotId || !futsalId || !message || !senderId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const slot = await Slot.findById(slotId).populate('players');
  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
  // Notify all players except sender
  const recipients = slot.players.filter(u => u._id.toString() !== senderId);
  const link = `/futsal/${futsalId}`;
  const notifPromises = recipients.map(user =>
    createNotification(
      user._id,
      'custom',
      'Futsal Match Ping',
      `This notification is to notify you about the futsal match: ${message}`,
      link,
      user._id
    )
  );
  await Promise.all(notifPromises);
  res.json({ success: true, message: 'Ping sent to all participants.' });
});

// POST /notifications/ping-all
// req.body: { message, senderId, futsalId }
const pingAllPlayers = asyncHandler(async (req, res) => {
  const { message, senderId, futsalId } = req.body;
  if (!message || !senderId || !futsalId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  // Get all users except sender
  const users = await User.find({ _id: { $ne: senderId } });
  const link = `/futsal/${futsalId}`;
  const notifPromises = users.map(user =>
    createNotification(
      user._id,
      'custom',
      'Futsal Match Ping',
      `This notification is to notify you about the futsal match: ${message}`,
      link,
      user._id
    )
  );
  await Promise.all(notifPromises);
  res.json({ success: true, message: 'Ping sent to all users.' });
});

export { pingFutsalParticipants, pingAllPlayers };
