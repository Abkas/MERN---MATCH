import mongoose, {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
import { SLOT_STATUS } from '../constants.js'
import {ApiError} from '../utils/ApiError.js'

const SlotSchema = new Schema({
    futsal: { 
        type: Schema.Types.ObjectId,
        ref: 'Futsal',
        required: true
    },
    date: {
        type: String,
        required: true 
    }, 
    time: {
        type: String,
        required: true
    },
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'User' 
    }],
    teamA: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    teamB: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    maxPlayers: {
        type: Number,
        default: 10 
    },
    price: {
        type: Number,
        required: true
    },
    status: { 
        type: String, 
        enum: Object.values(SLOT_STATUS), 
        default: SLOT_STATUS.AVAILABLE 
    },
    paymentStatus: [{ 
        playerId: {
            type: Schema.Types.ObjectId,
            ref: 'User' 
        },
        paid: Boolean 
    }],
    bookedOffline: { 
        type: Boolean, 
        default: false 
    },
    currentPlayers: {
        type: Number,
        default: 0
    },
    // Add challenge field for team challenges
    challenge: {
        status: { type: String, enum: ['pending', 'accepted', 'rejected', null], default: null },
        challenger: { type: Schema.Types.ObjectId, ref: 'MyTeam', default: null },
        opponent: { type: Schema.Types.ObjectId, ref: 'MyTeam', default: null },
        acceptedAt: { type: Date, default: null },
        createdAt: { type: Date, default: Date.now },
        paymentStatus: {
            challengerPaid: { type: Boolean, default: false },
            opponentPaid: { type: Boolean, default: false },
            refunded: { type: Boolean, default: false }
        }
    }
}, { timestamps: true });

// Static method to generate default slots for a futsal
SlotSchema.statics.generateDefaultSlots = async function(futsalId) {
    const slots = [];
    const today = new Date();
    
    // Generate slots for next 7 days
    for (let day = 0; day < 7; day++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + day);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Generate slots for each day (5 AM to 11 PM)
        for (let hour = 5; hour < 23; hour++) {
            const startHour = hour.toString().padStart(2, '0');
            const endHour = (hour + 1).toString().padStart(2, '0');
            
            slots.push({
                futsal: futsalId,
                date: dateStr,
                time: `${startHour}:00-${endHour}:00`,
                maxPlayers: 10,
                price: 500,
                status: SLOT_STATUS.AVAILABLE,
                players: [],
                paymentStatus: [],
                bookedOffline: false,
                currentPlayers: 0
            });
        }
    }
    
    return slots;
};

SlotSchema.methods.addPlayer = function (playerId, teamChoice, count = 1) {
    if (!this.isAvailable()) {
        throw new ApiError(400, 'Slot is not available for booking');
    }
    // Check if adding these players would exceed maxPlayers
    if (this.players.length + count > this.maxPlayers) {
        throw new ApiError(400, 'Not enough available slots');
    }
    // Team size limit (half of maxPlayers)
    const teamLimit = Math.ceil(this.maxPlayers / 2);
    let teamArr;
    if (teamChoice === 'A') {
        this.teamA = this.teamA || [];
        teamArr = this.teamA;
    } else if (teamChoice === 'B') {
        this.teamB = this.teamB || [];
        teamArr = this.teamB;
    } else {
        // Auto-balance if not specified
        const aCount = this.teamA ? this.teamA.length : 0;
        const bCount = this.teamB ? this.teamB.length : 0;
        if (aCount <= bCount) {
            this.teamA = this.teamA || [];
            teamArr = this.teamA;
        } else {
            this.teamB = this.teamB || [];
            teamArr = this.teamB;
        }
    }
    // Check if enough space in the team
    if (teamArr.length + count > teamLimit) {
        throw new ApiError(400, `Not enough space in Team ${teamChoice || (teamArr === this.teamA ? 'A' : 'B')}. Max ${teamLimit} players allowed.`);
    }
    // Add the playerId 'count' times to team and players (allow multiple bookings by same user)
    for (let i = 0; i < count; i++) {
        teamArr.push(playerId);
        this.players.push(playerId);
    }
    // Update currentPlayers count
    this.currentPlayers = this.players.length;
    // Update status if full
    if (this.isFull()) {
        this.status = SLOT_STATUS.FULL;
    }
    console.log(`[addPlayer] playerId: ${playerId}, team: ${teamChoice}, count: ${count}, players: ${this.players.length}, teamA: ${this.teamA.length}, teamB: ${this.teamB.length}`);
    return this.save();
}

SlotSchema.methods.removePlayer = function (playerId) {
    this.players.pull(playerId)
    return this.save()
}

SlotSchema.methods.getAvailableSlots = function () {
    return this.maxPlayers - this.players.length
}

SlotSchema.methods.getPaymentStatus = function (playerId) {
    const status = this.paymentStatus.find(
    status => status.playerId.toString() === playerId.toString())
    return status ? status.paid : false
}

SlotSchema.methods.getPlayersJoined = function () {
    return this.players
}

SlotSchema.methods.isAvailable = function () {
    return !this.isFull() && !this.bookedOffline;
}

SlotSchema.methods.isFull = function () {
    return this.players.length >= this.maxPlayers;
}

// Mark slot as team challenge (pending)
SlotSchema.methods.markAsTeamChallengePending = function (challengerTeamId) {
    this.challenge = {
        status: 'pending', // 'pending', 'accepted', 'rejected'
        challenger: challengerTeamId,
        opponent: null,
        acceptedAt: null
    };
    return this.save();
}

// Accept team challenge (remove individuals if <60% filled)
SlotSchema.methods.acceptTeamChallenge = async function (opponentTeamId) {
    const fillPercent = this.players.length / this.maxPlayers;
    if (fillPercent >= 0.6) {
        throw new ApiError(400, 'Slot is more than 60% filled and cannot be used for team challenge.');
    }
    // Remove all individual players
    this.players = [];
    this.teamA = [];
    this.teamB = [];
    this.currentPlayers = 0;
    this.challenge.status = 'accepted';
    this.challenge.opponent = opponentTeamId;
    this.challenge.acceptedAt = new Date();
    await this.save();
    return this;
}

// Static method to list open challenges
SlotSchema.statics.listOpenChallenges = async function() {
    return this.find({
        'challenge.status': 'pending',
        status: 'available',
        bookedOffline: false
    }).populate('futsal').populate('challenge.challenger');
};

// Instance method to mark payment
SlotSchema.methods.markChallengePayment = async function(teamType) {
    if (teamType === 'challenger') this.challenge.paymentStatus.challengerPaid = true;
    if (teamType === 'opponent') this.challenge.paymentStatus.opponentPaid = true;
    await this.save();
};

// Instance method to refund if no one joins
SlotSchema.methods.refundIfNoOpponent = async function() {
    const now = new Date();
    const created = this.challenge.createdAt || this.createdAt;
    // 24 hour window for example
    if (this.challenge.status === 'pending' && !this.challenge.opponent && !this.challenge.paymentStatus.refunded && (now - created) > 24*60*60*1000) {
        this.challenge.paymentStatus.refunded = true;
        // TODO: Integrate with payment gateway to actually refund
        await this.save();
        return true;
    }
    return false;
};

SlotSchema.statics.findByFutsalAndDate = function (futsalId, date) {
    return this.find(
        { futsal: futsalId,
         date 
        })
}

SlotSchema.statics.findAvailableSlots = function (futsalId, date) {
    return this.find(
        {futsal: futsalId,
         date, 
         status: SLOT_STATUS.AVAILABLE })
}

SlotSchema.pre('remove', async function (next) {
    await mongoose.model('Game').deleteMany({ slot: this._id })
    next()
})

export const Slot = mongoose.model('Slot', SlotSchema);