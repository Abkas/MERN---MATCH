import express from 'express';
import {getUserNotifications,markAsRead,createNotification} from '../controllers/notification.controller.js';
import { pingFutsalParticipants, pingAllPlayers } from '../controllers/notification.special.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
.get('/', verifyJWT, getUserNotifications);

router
.patch('/:id/read', verifyJWT, markAsRead);

router.post('/ping-futsal', verifyJWT, pingFutsalParticipants);
router.post('/ping-all', verifyJWT, pingAllPlayers);


export default router
