import { User } from "../models/user_auth_model.js";
export const requireAdmin = (req, res, next) => {
  // req.user đã có sẵn nhờ protectRoute chạy trước đó
  if (req.user && req.user.Role === 'Admin') {
    next();
  } else {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
};