import express from 'express';
import myTeamController from '../controllers/myteam.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

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
router.patch('/avatar', verifyJWT, upload.single('avatar'), myTeamController.updateTeamAvatar);
router.get('/all', myTeamController.getAllTeams);
router.post('/request-join', verifyJWT, myTeamController.requestToJoinTeam);
router.post('/accept-join-request', verifyJWT, myTeamController.acceptJoinRequest);
router.post('/decline-join-request', verifyJWT, myTeamController.declineJoinRequest);
router.get('/my-join-requests', verifyJWT, myTeamController.getMyJoinRequests);
router.post('/cancel-join-request', verifyJWT, myTeamController.cancelJoinRequest);

export default router;
