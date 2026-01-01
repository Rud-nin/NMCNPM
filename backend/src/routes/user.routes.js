import express from "express";
import { protectRoute } from "../midddleware/auth.middleware.js";
import { requireAdmin } from "../midddleware/admin.middleware.js";
import { getAllUsers, getUserById, updateUser, deleteUser,createUser } from "../controllers/user.controller.js";

const router = express.Router();
router.use(protectRoute,requireAdmin);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;