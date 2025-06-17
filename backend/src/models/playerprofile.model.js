import mongoose, {Schema} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const PlayerProfileSchema = new Schema(
{
user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
},

  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },

  location: {
    type: String,
    default: '' ,
    trim: true,
  },

  bio: {
    type: String,
    default: '' ,
    trim: true,
  },

  preferences: {
    type: String,
    enum: ['casual', 'competitive'],
    default: 'casual',
  },

  availability: {
    type: String,
    enum: ['weekdays', 'weekends', 'Weekdays and Weekends'],
    default: 'Weekdays and Weekends',
  },
  
  followedFutsals: [
    { 
    type: Schema.Types.ObjectId, 
    ref: 'Futsal' 
    }
  ],

  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  pendingFriendRequests: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  dateOfBirth:{
    type: Date
  },
  reviews: [
    { player: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
    },
      comment: String,
      rating: Number,
    }
  ]
}, { timestamps: true });

export const PlayerProfile = mongoose.model('PlayerProfile', PlayerProfileSchema)
