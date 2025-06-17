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

  dateOfBirth:{
    type: Date
  },
  reviews: [
      { 
        player: { 
          type: Schema.Types.ObjectId, 
          ref: 'User' 
        },
        comment: String,
        rating: Number,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
}, 
{
    timestamps: true
})

PlayerProfileSchema.plugin(mongooseAggregatePaginate)

export const PlayerProfile = mongoose.model('PlayerProfile', PlayerProfileSchema)
