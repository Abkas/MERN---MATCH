import mongoose, {Schema} from 'mongoose' 
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
import { GAME_STATUS } from '../constants.js'

const GameSchema = new Schema({
    futsal: { 
        type: Schema.Types.ObjectId,
        ref: 'Futsal', 
        required: true 
    },
    slot: { 
        type: Schema.Types.ObjectId, 
        ref: 'Slot', 
        required: true 
    },
    players: [
        {
        type: Schema.Types.ObjectId, 
        ref: 'User' 
        }
    ],
    status: { 
    type: String, 
    enum: Object.values(GAME_STATUS), 
    default: GAME_STATUS.SCHEDULED 
    },
    result: {
        type: String 
    },
    feedbacks: [
        {
        player: { 
            type: Schema.Types.ObjectId, 
            ref: 'User' 
        },
        comment: String,
        rating: {
            type: Number,
            min: 1,
            max: 5
        }
        }
    ],
    time: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

GameSchema.plugin(mongooseAggregatePaginate);    

export const Game = mongoose.model('Game', GameSchema);
