import express from "express";
import { protectRoute } from "../midddleware/auth.middleware.js";
import { requireAdmin } from "../midddleware/admin.middleware.js";
import { createService, getServices, updateService, deleteService } from "../controllers/service.controller.js";

const router = express.Router();

// User/Admin xem danh sách
router.get("/", protectRoute, getServices);

// Admin thao tác
router.post("/", protectRoute, requireAdmin, createService);
router.put("/:id", protectRoute, requireAdmin, updateService);
router.delete("/:id", protectRoute, requireAdmin, deleteService);

export default router;