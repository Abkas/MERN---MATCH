import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendsList,
    getPendingRequests
} from "../controllers/friend.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/send", sendFriendRequest);
router.put("/accept/:requestId", acceptFriendRequest);
router.delete("/reject/:requestId", rejectFriendRequest);
router.get("/list", getFriendsList);
router.get("/pending", getPendingRequests);

export default router;
