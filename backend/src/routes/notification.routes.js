import express from "express"
import {protectRoute} from "../midddleware/auth.middleware.js";
import { requireAdmin } from "../midddleware/admin.middleware.js"; 
import { sendNotification, getNotifications } from "../controllers/notification.controller.js";

const router = express.Router();

//Phân luồng user thường chỉ có quyền xem
router.get("/", protectRoute,getNotifications);

router.post("/", protectRoute,requireAdmin,sendNotification);

export default router;