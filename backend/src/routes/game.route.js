import { Router } from 'express'
import {
    createGame,
    updateGame,
    getGamesById,
    deleteGame,
    updateGameResult,
    addFeedback
} from '../controllers/game.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

router
.route('/create-game')
.post(verifyJWT, createGame)

router
.route('/get-Game/:id')
.get(getGamesById);

router
.route('/update-Game/:id')
.patch(verifyJWT, updateGame)

router
.route('/delete-Game/:id')
.delete(verifyJWT, deleteGame)

router
.route('/update-game-result/:id')
.post(verifyJWT, updateGameResult)

router
.route('/add-feedback/:id')
.post(verifyJWT, addFeedback);

export default router;