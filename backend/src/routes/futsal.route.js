import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getAllFutsals, getFutsalsByLocation, getFutsalById } from '../controllers/futsal.controller.js';

const router = Router();

// Public routes (no authentication required)
router.route('/all').get(getAllFutsals);
router.route('/location/:location').get(getFutsalsByLocation);
router.route('/:id').get(getFutsalById);

export default router; 