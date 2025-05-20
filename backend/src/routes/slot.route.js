import { Router } from 'express'
import {
    createSlot,
    updateSlot,
    getSlotsByFutsal,
    joinSlot,
    deleteSlot
} from '../controllers/slot.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

router
.route('/create-slot/:futsalId')
.post(verifyJWT, createSlot) 

router
.route('/getSlotsByFutsal')
.get(verifyJWT, getSlotsByFutsal)

router
.route('/updateSlot/:id')
.patch(verifyJWT, updateSlot) 

router
.route('/deleteSlot/:id')
.delete(verifyJWT, deleteSlot)

router
.route('/join-slot/:id')
.post(verifyJWT, joinSlot)



export default router