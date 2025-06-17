import { Slot } from '../models/slot.model.js';
import { createNotification } from '../controllers/notification.controller.js';

/**
 * Sends reminder notifications for slots approaching in the next hour
 * This function should be called on a schedule (e.g., every 5 minutes)
 */
export const sendSlotReminders = async () => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    // Find slots starting in the next hour
    const upcomingSlots = await Slot.find({
      date: now.toISOString().split('T')[0], // Today
      // Convert time string (e.g., "14:00") to Date for comparison
      // This is a simplified approach - you may need to adjust based on your time format
      $expr: {
        $and: [
          { $gte: [{ $toDate: { $concat: ["$date", "T", "$time", ":00"] } }, now] },
          { $lte: [{ $toDate: { $concat: ["$date", "T", "$time", ":00"] } }, oneHourLater] }
        ]
      },
      reminderSent: { $ne: true } // Only slots where reminder hasn't been sent
    }).populate('futsal').populate('players');

    console.log(`Found ${upcomingSlots.length} upcoming slots for reminders`);

    // Send notifications to all players in those slots
    for (const slot of upcomingSlots) {
      // Send to players
      for (const player of slot.players) {
        await createNotification(
          player._id,
          'reminder',
          'Upcoming Match Reminder',
          `Your match at ${slot.futsal.name} starts in 1 hour (${slot.time}).`,
          `/player-upcomingmatches`
        );
      }

      // Send to futsal owner
      if (slot.futsal && slot.futsal.owner) {
        await createNotification(
          slot.futsal.owner,
          'reminder',
          'Upcoming Slot Reminder',
          `You have a booked slot starting in 1 hour (${slot.time}).`,
          `/organizer-slots`
        );
      }

      // Mark reminder as sent
      slot.reminderSent = true;
      await slot.save();
    }

    return upcomingSlots.length;
  } catch (error) {
    console.error('Error sending slot reminders:', error);
    return 0;
  }
};
