import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requestTeamChallenge, acceptTeamChallenge, listOpenChallenges, joinChallenge, refundIfNoOpponent } from '../controllers/challenge.controller.js';
import { getAllFutsals, getEligibleSlotsForChallenge } from '../controllers/challengeList.controller.js';

const router = Router();

// Request a team challenge for a slot
router.post('/request/:slotId', verifyJWT, requestTeamChallenge);
// Accept a team challenge for a slot
router.post('/accept/:slotId', verifyJWT, acceptTeamChallenge);
// List all futsals for challenge creation
router.get('/futsals', getAllFutsals);
// List eligible slots for a futsal for challenge creation
router.get('/eligible-slots/:futsalId', getEligibleSlotsForChallenge);
// List all open challenges
router.get('/open', listOpenChallenges);
// Join a challenge for a slot
router.post('/join/:slotId', verifyJWT, joinChallenge);
// Refund challenger if no one joins
router.post('/refund/:slotId', verifyJWT, refundIfNoOpponent);

export default router;
