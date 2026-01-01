import express from "express";
import { protectRoute } from "../midddleware/auth.middleware.js";
import { requireAdmin } from "../midddleware/admin.middleware.js";
import {
  createRoomRequest,
  getMyRoomRequests,
  getAllRoomRequests,
  cancelRoomRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest
} from "../controllers/roomRequest.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createRoomRequest);
router.get("/", getMyRoomRequests);
router.delete("/:id", cancelRoomRequest);

router.get("/pending", requireAdmin, getPendingRequests);
router.get("/all", requireAdmin, getAllRoomRequests);
router.put("/:id/approve", requireAdmin, approveRequest);
router.put("/:id/reject", requireAdmin, rejectRequest);

export default router;
