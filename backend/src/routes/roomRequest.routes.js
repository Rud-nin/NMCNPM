import express from "express";
import { protectRoute } from "../midddleware/auth.middleware.js";
import { requireAdmin } from "../midddleware/admin.middleware.js";
import {
  createRoomRequest,
  getMyRoomRequests,
  cancelRoomRequest,
  approveRequest,
  rejectRequest,
  getRoomRequests
} from "../controllers/roomRequest.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createRoomRequest);
router.get("/me", getMyRoomRequests);
router.delete("/:id", cancelRoomRequest);

router.get("/", requireAdmin, getRoomRequests);
router.put("/:id/approve", requireAdmin, approveRequest);
router.put("/:id/reject", requireAdmin, rejectRequest);

export default router;
