import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getPlayerProfile, updatePlayerProfile } from '../controllers/player.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// GET /player/profile
router.get('/profile', verifyJWT, getPlayerProfile);

// PATCH /player/update-profile
router.patch('/update-profile', verifyJWT, upload.single('avatar'), updatePlayerProfile);

export default router;
