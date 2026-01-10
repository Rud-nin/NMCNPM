import express from "express"
import { protectRoute } from "../midddleware/auth.middleware.js";
import { requireAdmin } from "../midddleware/admin.middleware.js"; 
import { sendNotification, getNotifications } from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protectRoute);

// Phân luồng user thường chỉ có quyền xem
router.get("/", getNotifications);

router.post("/", requireAdmin, sendNotification);

export default router;