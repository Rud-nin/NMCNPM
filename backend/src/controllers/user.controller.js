import { User } from "../models/user.model.js";
import { Payment } from "../models/payment.model.js";
import bcrypt from "bcryptjs";

// @route   GET /api/users
export const getAllUsers = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const keyword = req.query.search || null;

        const result = await User.getAll({page, limit, keyword});
        if (result.mode === 'search') {
            // Trường hợp tìm kiếm - trả về list ds người dùng 
            return res.status(200).json({
                success: true,
                message: `Found ${result.totalCount} results for "${keyword}"`,
                pagination: null, 
                data: result.users
            });
        } else {
            // Trường hợp phân trang bình thường
            const totalPages = Math.ceil(result.totalCount / limit);
            return res.status(200).json({
                success: true,
                pagination: {
                    page,
                    limit,
                    totalRows: result.totalCount,
                    totalPages
                },
                data: result.users
            });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/users/:id
export const getUserById = async (req,res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return  res.status(404).json({message: "User not found"});
        }
        const unpaidBills = await Payment.getUnpaidBills(user.UserID);
        res.status(200).json({
            success: true,
            ...user,
            UnpaidBills: unpaidBills,
            TotalDebt: unpaidBills.reduce((sum, bill) => sum + bill.Price, 0)
        });
    } catch(error) {
        res.status(500).json({message: "Server error" });
    }
};

// @route GET /api/users/me
export const getMe = async (req, res) => {
    try {
        const userId = req.user.UserID; 
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const unpaidBills = await Payment.getUnpaidBills(userId);
        const totalDebt = unpaidBills.reduce((sum, bill) => sum + bill.Price, 0);

        res.status(200).json({
            success: true,
            user: {
                ...user,           
                TotalDebt: totalDebt,
                UnpaidBills: unpaidBills
            }
        });

    } catch (error) {
        console.error("Get Me Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @route   POST /api/users
export const createUser = async (req, res) => {
    const { FullName, Email, Password, BirthDate, ResidentType = 'Thường trú', HomeTown, ID, Role } = req.body;

    try {
        if (!Email || !Password || !FullName) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingUser = await User.findByEmail(Email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Password, salt);

        const newUser = await User.create({
            FullName, Email, Password: hashedPassword, BirthDate, ResidentType, HomeTown, ID, Role
        });

        res.status(201).json({ message: "User created successfully", data: newUser });

    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { FullName, BirthDate, ResidentType, HomeTown, ID, Role } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (ResidentType && !['Thường trú', 'Tạm trú', 'Tạm vắng'].includes(ResidentType)) {
            return res.status(400).json({ message: "Invalid resident type" });
        }

        await User.updateUserProfile(id, { FullName, BirthDate, ResidentType, HomeTown, ID, Role });
        res.status(200).json({ message: "User updated successfully" });

    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Chặn admin tự xóa chính mình
        if (parseInt(id) === req.user.UserID) {
            return res.status(400).json({ message: "Cannot delete yourself" });
        }

        await User.deleteUser(id);
        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        console.error("Delete user error:", error.message);
        // Xử lý lỗi khóa ngoại (Foreign Key)
        if (error.message.includes("REFERENCE constraint")) {
            return res.status(409).json({ 
                message: "Cannot delete user because they have related data (Payments, Topups, etc.)." 
            });
        }
        res.status(500).json({ message: "Server error" });
    }
};