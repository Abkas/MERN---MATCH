import { Notification } from '../models/notification.model.js';

const getUserNotifications = async (req, res) => {
  try {
    // Delete notifications older than 3 hours
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    await Notification.deleteMany({ user: req.user._id, createdAt: { $lt: threeHoursAgo } });
    // Get 5 most recent notifications
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json({ notification: notif });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// Create a notification (for use in your business logic)
const createNotification = async (userId, type, title, message, link = '') => {
  try {
    const notif = new Notification({
      user: userId,
      type,
      title,
      message,
      link
    });
    await notif.save();
    return notif;
  } catch (err) {
    // Optionally log error
    return null;
  }
};

export{
    getUserNotifications,
    markAsRead,
    createNotification
}