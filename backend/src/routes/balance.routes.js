import express from "express";
import { protectRoute } from "../midddleware/auth.middleware.js";
import { getMyBalance } from "../controllers/balance.controller.js"; 

const router = express.Router();
router.use(protectRoute);

router.get("/", getMyBalance);

export default router;