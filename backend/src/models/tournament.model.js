import mongoose, {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const TournamentSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    organizer: { 
        type: Schema.Types.ObjectId,
        ref: 'OrganizerProfile',
        required: true 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    teams: [{
        name: String,
        players: [
            { 
            type: Schema.Types.ObjectId,
            ref: 'PlayerProfile' 
            }
        ],
    }],
    matches: [{
        teamA: String,
        teamB: String,
        scoreA: Number,
        scoreB: Number,
        matchDate: Date,
    }],
    prizes: [{
        position: Number,
        prize: String,
    }],
    rules: { 
        type: String 
    },
    format: { 
        type: String 
    },
    registrationFee: { 
        type: Number 
    },
    venue: { 
        type: String 
    },
});


TournamentSchema.plugin(mongooseAggregatePaginate);

export const Tournament = mongoose.model('Tournament', TournamentSchema);
