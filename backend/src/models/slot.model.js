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

SlotSchema.methods.addPlayer = function (playerId) {
    if (!this.isAvailable()) {
        throw new ApiError(400, 'Slot is not available for booking');
    }
    

    
    // Check if adding this player would exceed maxPlayers
    if (this.players.length >= this.maxPlayers) {
        throw new ApiError(400, 'Slot is full');
    }

    // Add the player to the players array
    this.players.push(playerId);
    
    // Update currentPlayers count
    this.currentPlayers = this.players.length;
    
    // Update status if full
    if (this.isFull()) {
        this.status = SLOT_STATUS.FULL;
    }
    
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