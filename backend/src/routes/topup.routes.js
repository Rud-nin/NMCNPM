import express from "express"
import { protectRoute } from "../midddleware/auth.middleware.js"
import { requireAdmin } from "../midddleware/admin.middleware.js"
import {
  createTopUp,
  getAllTopUps,
  getMyTopUps,
  acceptTopUp,
  rejectTopUp
} from "../controllers/topup.controller.js"

const router = express.Router()

router.use(protectRoute)

router.get("/me", getMyTopUps)
router.post("/", createTopUp)

router.get("/", requireAdmin, getAllTopUps)
router.patch("/:id/accept", requireAdmin, acceptTopUp)
router.patch("/:id/reject", requireAdmin, rejectTopUp)

export default router
