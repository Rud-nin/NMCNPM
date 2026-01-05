import express from "express";
import { protectRoute } from "../midddleware/auth.middleware.js";
import { requireAdmin } from "../midddleware/admin.middleware.js";
import {
  getRooms,
  getAvailableRooms,
  createRoom,
  deleteRoom,
  assignRoomToUser,
  removeUserFromRoom,
  getUsersInMyRoom,
  getUsersInRoomByAdmin
} from "../controllers/room.controller.js";

import {
  addServiceToRoom,
  getMyRoomServices,
  getRoomServices,
  removeServiceFromRoom
} from "../controllers/roomService.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getRooms);
router.get("/available", getAvailableRooms);
router.get("/me", getUsersInMyRoom);
router.get("/services", getMyRoomServices);

router.post("/", requireAdmin, createRoom);
router.delete("/:id", requireAdmin, deleteRoom);

router.put("/assign", requireAdmin, assignRoomToUser);
router.put("/remove/:userId", requireAdmin, removeUserFromRoom);
router.get("/:id", requireAdmin, getUsersInRoomByAdmin);

router.get("/:id/services", requireAdmin, getRoomServices);
router.post("/:id/services", requireAdmin, addServiceToRoom);
router.delete("/:id/services/:serviceId", requireAdmin, removeServiceFromRoom);

export default router;
