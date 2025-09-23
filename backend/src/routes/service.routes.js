import express from "express";
import { protectRoute } from "../midddleware/auth.middleware.js";
import { requireAdmin } from "../midddleware/admin.middleware.js";
import { createService,
    getServices,
    updateService,
    deleteService,
    getMyServices,
    getUserServices,
    assignService,
    removeUserService
} from "../controllers/service.controller.js";

const router = express.Router();

router.use(protectRoute)

// Lấy danh sách service user (có cả service phòng)
router.get("/", getMyServices);

// Admin thao tác
router.get("/all", requireAdmin, getServices); // Lấy tất cả service
router.get("/users/:userId", requireAdmin, getUserServices); // Lấy service của user
router.post("/assign", requireAdmin, assignService); // Thêm service cho user
router.delete("/remove", requireAdmin, removeUserService); // Xoá service của user

router.post("/", requireAdmin, createService);
router.put("/:id", requireAdmin, updateService);
router.delete("/:id", requireAdmin, deleteService);

export default router;