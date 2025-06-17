import mongoose, {Schema} from 'mongoose' 


const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['match_joined', 'slot_full', 'payment_ready', 'reminder', 'custom', 'FRIEND_REQUEST', 'FRIEND_REQUEST_ACCEPTED'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ''
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Notification = mongoose.model('Notification', notificationSchema);
