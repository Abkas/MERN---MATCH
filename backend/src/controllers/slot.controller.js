import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { Slot } from '../models/slot.model.js'
import { Game } from '../models/game.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const createSlot = asyncHandler(async (req, res) => {
    const { date, time, price, maxPlayers } = req.body
    const { futsalId } = req.params

    if (!futsalId || !date || !time || !price || !maxPlayers) {
        throw new ApiError(400, 'All fields are required')
    }

    const newSlot = await Slot.create({
        futsal: futsalId,
        date,
        time,
        price,
        maxPlayers
    })

    const newGame = await Game.create({
        futsal: futsalId,
        slot: newSlot._id,
        players: [],
        time
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201, { slot: newSlot, game: newGame }, 'Slot and game created successfully')
    )
})

 const updateSlot = asyncHandler(async (req, res) => {
    const {id} = req.params
    const updates = req.body

    const updatedSlot = await Slot.findByIdAndUpdate(
        id, 
        {$set:updates},
        {new: true})

    if (!updatedSlot) {
        throw new ApiError(404, 'Slot not found')
    }

    if (updates.maxPlayers || updates.date || updates.time) {
        await Game.findOneAndUpdate(
        { slot: id }, 
        { ...updates }
        )
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedSlot, 'Slot updated successfully'))
})

const getSlotsByFutsal = asyncHandler(async (req, res) => {
    const {futsalId} = req.params

    const slots = await Slot.find({futsal: futsalId}).sort({date: 1,time: 1})

    return res
    .status(200)
    .json(new ApiResponse(200, slots, 'Slots fetched successfully'))
})

const joinSlot = asyncHandler(async (req, res) => {
    const {id} = req.params

    const playerId = req.user._id
    const slot = await Slot.findById(id)

    if (!slot) {
        throw new ApiError(404, 'Slot not found')
    }
    await slot.addPlayer(playerId)

    if (slot.isFull()) {
        const game = await Game.findOne({ slot: id });
        game.status = 'ready_to_play'
        await game.save()
    }

    return res
    .status(200)
    .json(new ApiResponse(200, slot, 'Player added to slot successfully'))
})

const deleteSlot = asyncHandler(async (req, res) => {
    const {slotId} = req.params;

    const deletedSlot = await Slot.findByIdAndDelete(slotId)

    if (!deletedSlot) {
        throw new ApiError(404, 'Slot not found')
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},'Slots deleted successfully'))
})

export{
    createSlot,
    updateSlot,
    getSlotsByFutsal,
    joinSlot,
    deleteSlot}