import { Payment } from "../models/payment_model.js";

export const payBills = async (req, res) => {
    try {
        const { billIds } = req.body;
        const userId = req.user.UserID;

        if (!billIds || !Array.isArray(billIds) || billIds.length === 0) {
            return res.status(400).json({ message: "billIds is required and should be a non-empty array" });
        }
        const result = await Payment.payBills(userId, billIds);
        res.status(200).json({
            success: true,
            message: "Bills paid successfully",
            data: result
        });
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({
            message: "Server error"
        })
    }

};

export const getUnpaidBills = async (req, res) => {
    try {
        const userId = req.user.UserID;
        
        const bills = await Payment.getUnpaidBills(userId);

        res.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });

    } catch (error) {
        console.error("Error fetching unpaid bills:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// @route GET /api/payments/history?page=1&limit=10
export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.UserID; 
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: "Page và Limit phải lớn hơn 0" });
        }

        const { data, total } = await Payment.getHistory(userId, { page, limit });
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            pagination: {
                page,
                limit,
                totalRows: total,
                totalPages
            },
            data: data
        });

    } catch (error) {
        console.error("Error fetching payment history:", error.message);
        res.status(500).json({ message: "Server error" });
    };
};

    // @route GET /api/payments/admin/history
export const getAdminPaymentHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || ''; // Cho phép tìm theo tên/email

        const { data, total } = await Payment.getAllHistoryForAdmin({ page, limit, search });

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            pagination: { page, limit, totalRows: total, totalPages },
            data: data
        });
    } catch (error) {
        console.error("Admin History Error:", error.message);
        res.status(500).json({ message: "Server error." });
    }
};
