import { Service } from "../models/service_model.js";

// @route POST /api/services
export const createService = async (req, res) => {
    try {
        const { ServiceName, Price, Descriptions } = req.body;
        
        // Validate: Chỉ cần Tên và Giá
        if (!ServiceName || Price === undefined) {
            return res.status(400).json({ message: "Service name and price are required." });
        }

        const newService = await Service.create({ ServiceName, Price, Descriptions });
        res.status(201).json({ success: true, data: newService });
    } catch (error) {
        console.error("Create service error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @route GET /api/services
export const getServices = async (req, res) => {
    try {
        const services = await Service.getAll();
        res.status(200).json(services);
    } catch (error) {
        console.error("Get service error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @route PUT /api/services/:id
export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { ServiceName, Price, Descriptions } = req.body;
        
        await Service.update(id, { ServiceName, Price, Descriptions });
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