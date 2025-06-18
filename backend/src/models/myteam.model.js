import mongoose from 'mongoose';
const { Schema } = mongoose;

const slotSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['empty', 'filled', 'pending'], default: 'empty' }
}, { _id: false });

const inviteSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  slotIndex: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
}, { _id: false });

const joinRequestSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
}, { _id: false });

const myTeamSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  slots: [slotSchema],
  pendingInvites: [inviteSchema],
  joinRequests: [joinRequestSchema],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
});

export default mongoose.model('MyTeam', myTeamSchema);
