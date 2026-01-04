import express from "express";
import {protectRoute} from "../midddleware/auth.middleware.js";
import { getAllFeedbacks, sendFeedback,updateFeedbackStatus,deleteFeedback } from "../controllers/feedback.controller.js";
import { requireAdmin } from "../midddleware/admin.middleware.js";

const router = express.Router();
router.post("/", protectRoute, sendFeedback);
router.get("/",protectRoute,requireAdmin, getAllFeedbacks);
router.put("/:id/status", protectRoute, requireAdmin, updateFeedbackStatus);
router.delete("/:id", protectRoute, requireAdmin, deleteFeedback);

export default router;