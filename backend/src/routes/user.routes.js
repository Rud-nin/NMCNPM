import express from "express";
import { protectRoute } from "../midddleware/auth.middleware.js";
import { requireAdmin } from "../midddleware/admin.middleware.js";
import { getAllUsers, getUserById, updateUser, deleteUser,createUser, getMe } from "../controllers/user.controller.js";

const router = express.Router();
router.use(protectRoute);

router.get("/me", getMe);
router.get("/", requireAdmin,getAllUsers);
router.get("/:id",requireAdmin, getUserById);
router.post("/",requireAdmin, createUser);
router.put("/:id",requireAdmin, updateUser);
router.delete("/:id",requireAdmin, deleteUser);

export default router;