import mongoose, {Schema} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const OrganizerProfileSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    },

  bio: { 
    type: String, 
    default: ''  
    },

  isVerified: { 
    type: Boolean, 
    default: false 
    },

  futsals: [
    { type: Schema.Types.ObjectId, 
    ref: 'Futsal' 
    }
  ],
  
}, { timestamps: true });

export const OrganizerProfile = mongoose.model('OrganizerProfile', OrganizerProfileSchema);
