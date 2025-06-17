import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {    
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendsList,
    getPendingRequests,
    getSentRequests,
    cancelFriendRequest,
    getAllFriendships
} from "../controllers/friend.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/send", sendFriendRequest);
router.put("/accept/:requestId", acceptFriendRequest);
router.delete("/reject/:requestId", rejectFriendRequest);
router.delete("/cancel/:recipientId", cancelFriendRequest);
router.get("/list", getFriendsList);
router.get("/pending", getPendingRequests);
router.get("/sent", getSentRequests);
router.get("/all-friendships", getAllFriendships);  // New endpoint

export default router;
