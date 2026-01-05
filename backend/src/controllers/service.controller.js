import { Service } from "../models/service.model.js";

// @route POST /api/services
export const createService = async (req, res) => {
    try {
        const { ServiceName, Price, Descriptions, Type } = req.body;
        
        // Validate: Chỉ cần Tên và Giá
        if (!ServiceName || Price === undefined) {
            return res.status(400).json({ message: "Service name and price are required." });
        }
        const validTypes = ['Personal', 'Room'];
        // Nếu người dùng không gửi Type, mặc định là Personal. Nếu gửi, phải đúng danh sách.
        const finalType = Type || 'Personal';
        if (!validTypes.includes(finalType)) {
            return res.status(400).json({ message: "Invalid type. Must be 'Personal' or 'Room'." });
        }

        const newService = await Service.create({ ServiceName, Price, Descriptions, Type: finalType });
        res.status(201).json({ success: true, data: newService });
    } catch (error) {
        console.error("Create service error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @route GET /api/services
export const getServices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: "Page and limit must be positive integers" });
        }
        const {services, totalCount} = await Service.getAll({ page, limit });
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({
            success: true,
            pagination: {
                page: page,
                limit: limit,
                total: totalCount,
                totalPages: totalPages
            },
            data: services
        });
    } catch (error) {
        console.error("Get service error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @route PUT /api/services/:id
export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { ServiceName, Price, Descriptions, Type } = req.body;
        if (Type && !['Personal', 'Room'].includes(Type)) {
            return res.status(400).json({ message: "Invalid type. Must be 'Personal' or 'Room'." });
        }
        await Service.update(id, { ServiceName, Price, Descriptions, Type });
        res.status(200).json({ success: true, message: "Update completed" });
    } catch (error) {
        console.error("Update service error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @route DELETE /api/services/:id
export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        await Service.delete(id);
        res.status(200).json({ success: true, message: "Delete completed" });
    } catch (error) {
        console.error("Delete service error:", error.message);
        // Trả về lỗi 409 (Conflict) nếu dính khóa ngoại
        res.status(409).json({ message: error.message || "Server error." });
    }
};