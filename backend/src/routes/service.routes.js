import express from "express";
import { protectRoute } from "../midddleware/auth.middleware.js";
import { requireAdmin } from "../midddleware/admin.middleware.js";
import { createService,
    getServices,
    updateService,
    deleteService,
    getMyServices,
    getUserServices,
    assignUserService,
    removeUserService,
    getMyRoomServices,
    getRoomServices,
    assignRoomService,
    removeRoomService
} from "../controllers/service.controller.js";

const router = express.Router();

router.use(protectRoute)

// Lấy danh sách service user (có cả service phòng)
router.get("/users", getMyServices);
router.get("/rooms", getMyRoomServices);

// Admin thao tác
router.get("/all", requireAdmin, getServices); // Lấy tất cả service

router.get("/users/:userId", requireAdmin, getUserServices); // Lấy service của user
router.post("/users/assign", requireAdmin, assignUserService); // Thêm service cho user
router.delete("/users/remove", requireAdmin, removeUserService); // Xoá service của user

router.get("/rooms/:roomId", requireAdmin, getRoomServices); // Lấy service của room
router.post("/rooms/assign", requireAdmin, assignRoomService); // Thêm service cho room
router.delete("/rooms/remove", requireAdmin, removeRoomService); // Xoá service của room

router.post("/", requireAdmin, createService);
router.patch("/:id", requireAdmin, updateService);
router.delete("/:id", requireAdmin, deleteService);

export default router;