import { Bill } from "../models/bill.model.js";
import { User } from "../models/user.model.js";

// @route POST /api/bills/assign
export const assignService = async (req, res) => {
    try {
        const { userId, serviceId, period } = req.body;

        if (!userId || !serviceId || !period) {
            return res.status(400).json({ message: "Missing required fields: userId, serviceId, or period" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Tạo Bill
        const newBill = await Bill.create({ 
            userId, 
            serviceId, 
            period
        });

        res.status(201).json({ 
            success: true, 
            message: "Service assigned and bill created successfully", 
            data: newBill 
        });

    } catch (error) {
        console.error("Assign service error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @route DELETE /api/bills/:id
export const removeService = async (req, res) => {
    try {
        const { id } = req.params; 
        const result = await Bill.delete(id);
        
        if (result === null) {
            return res.status(404).json({ message: "Bill not found" });
        }

        res.status(200).json({ success: true, message: "Service removed from user successfully" });

    } catch (error) {
        console.error("Remove service error:", error.message);
        if (error.message.includes("Paid")) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};

// @route GET /api/bills/user/:userId
export const getUserBills = async (req, res) => {
    try {
        const { userId } = req.params;
        const bills = await Bill.getByUserId(userId);
        res.status(200).json({ success: true, data: bills });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}