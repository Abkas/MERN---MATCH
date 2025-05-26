import { Router } from 'express';
import {
    createFutsal,
    getFutsalsByOrganizer,
    updateFutsal,
    deleteFutsal,
    createTournament,
    getOrganizerProfileById,
    getCurrentOrganizerProfile,
    updateOrganizerProfile,
    updateOrganizerProfileById
} from '../controllers/organizer.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router
.route('/create-futsal')
.post(verifyJWT, createFutsal)

router
.route('/organizer-futsals')
.get(verifyJWT, getFutsalsByOrganizer)

router
.route('/update-futsal/:id')
.patch(verifyJWT, updateFutsal)

router
.route('/delete-futsal/:id')
.delete(verifyJWT, deleteFutsal)

router
.route('/create-tournaments')
.post(verifyJWT, createTournament)

router
.route('/profile/:id')
.get(verifyJWT, getOrganizerProfileById)
.patch(verifyJWT, upload.single('avatar'), updateOrganizerProfileById);

router
.route('/profile')
.get(verifyJWT, getCurrentOrganizerProfile)
.patch(verifyJWT, upload.single('avatar'), updateOrganizerProfile);

export default router