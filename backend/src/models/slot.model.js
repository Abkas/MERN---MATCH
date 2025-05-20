import mongoose , {Schema} from 'mongoose';
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
    players: [
        {
        type: Schema.Types.ObjectId,
        ref: 'User' 
        }
    ],
    maxPlayers: {
        type: Number,
        default: 10 
    },
    price:{
        type: Number,
        required: true
    },
    Slotstatus: { 
        type: String, 
        enum: Object.values(SLOT_STATUS), 
        default: SLOT_STATUS.AVAILABLE 
    },
    paymentStatus: [
        { 
        playerId: {
            type: Schema.Types.ObjectId,
            ref: 'User' 
        },
        paid: Boolean 
        }
    ],
    bookedOffline: { 
        type: Boolean, 
        default: false 
    },
}, { timestamps: true })

SlotSchema.methods.addPlayer = function (playerId) {
    if (!this.isAvailable()) {
        throw new ApiError('Slot is not available for booking')
    }
    if (this.players.includes(playerId)) {
        throw new ApiError('Player has already booked this slot')
    }
    if (this.isFull()) {
        throw new ApiError('Slot is full')
    }
    this.players.push(playerId)
    return this.save()
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
         Slotstatus: SLOT_STATUS.AVAILABLE })
}

SlotSchema.pre('remove', async function (next) {
    await mongoose.model('Game').deleteMany({ slot: this._id })
    next()
})

export const Slot = mongoose.model('Slot', SlotSchema);