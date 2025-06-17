import express from 'express';
import myTeamController from '../controllers/myteam.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', verifyJWT, myTeamController.createTeam);
router.post('/invite', verifyJWT, myTeamController.inviteToSlot);
router.post('/accept-invite', verifyJWT, myTeamController.acceptInvite);
router.post('/decline-invite', verifyJWT, myTeamController.declineInvite);
router.post('/update', verifyJWT, myTeamController.updateTeam);
router.get('/get-by-user', verifyJWT, myTeamController.getTeamByUser);
router.post('/remove-member', verifyJWT, myTeamController.removeMember);
router.post('/cancel-invite', verifyJWT, myTeamController.cancelInvite);
router.get('/pending-invites', verifyJWT, myTeamController.getPendingInvites);
router.post('/delete', verifyJWT, myTeamController.deleteTeam);

export default router;
