import express from "express";
import { protectRoute } from "../midddleware/auth.middleware.js";
import { requireAdmin } from "../midddleware/admin.middleware.js";
import { assignService, removeService, getUserBills } from "../controllers/bill.controller.js";

const router = express.Router();
router.use(protectRoute, requireAdmin);

router.post("/assign", assignService);
router.delete("/:id", removeService);
router.get("/user/:userId", getUserBills);

export default router;