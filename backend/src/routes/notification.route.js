import express from 'express';
import {getUserNotifications,markAsRead,createNotification} from '../controllers/notification.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
.get('/', verifyJWT, getUserNotifications);

router
.patch('/:id/read', verifyJWT, markAsRead);


export default router
