import { Router } from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getAllFriends,
    getPendingRequests
} from "../controllers/friendship.controller.js";

const router = Router();

// Apply auth middleware to all routes
router.use(verifyJWT);

// Friend system routes
router.post("/send-request", sendFriendRequest);
router.post("/accept-request", acceptFriendRequest);
router.post("/reject-request", rejectFriendRequest);
router.get("/list", getAllFriends);
router.get("/pending", getPendingRequests);

export default router;
