import { Service } from "../models/service.model.js";
import { User } from "../models/user.model.js";
import { Room } from "../models/room.model.js";

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

// @route GET /api/services
export const getMyServices = async (req, res) => {
  try {
    const services = await Service.getUserServices(req.user.UserID);
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRoomServices = async (req, res) => {
  try {
    const services = await Service.getRoomServices(req.user.RoomID);
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/services/users/:userId
export const getUserServices = async (req, res) => {
  try {
		const userId = req.params.userId; 
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found"
			});
		}

    const services = await Service.getUserServices(userId);
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/services/users/assign
export const assignUserService = async (req, res) => {
	try {
		const { UserID, ServiceID } = req.body;

		const service = await Service.findById(ServiceID);
		if (!service || service.Type !== "Personal") {
			return res.status(400).json({
				success: false,
				message: "Không tìm thấy dịch vụ cá nhân hợp lệ"
			});
		}

    await Service.addServiceToUser(UserID, ServiceID);
    res.status(200).json({ success: true, message: "Service assigned successfully" });
  } catch (error) {
		console.log("Assign user service error:", error.message);

		if (error.message.includes("PK_UserServices")) {
      return res.status(409).json({
        success: false,
        message: "User has already had this service"
      });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route DELETE /api/services/users/remove
export const removeUserService = async (req, res) => {
	
	try {
		const { UserID, ServiceID } = req.body;

		const service = await Service.findById(ServiceID);
		if (!service || service.Type !== "Personal") {
			return res.status(400).json({
				success: false,
				message: "Không tìm thấy dịch vụ cá nhân hợp lệ"
			});
		}

    await Service.removeServiceFromUser(UserID, ServiceID);
    res.status(200).json({ success: true, message: "Service removed successfully" });
  } catch (error) {
		console.log("Remove user service error: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route GET /api/services/rooms/:roomId
export const getRoomServices = async (req, res) => {
  try {
		const roomId = req.params.roomId;
		const room = await Room.findById(roomId);
		if (!room) {
			return res.status(404).json({
				success: false,
				message: "Room not found"
			});
		}

    const services = await Service.getRoomServices(roomId);
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/services/rooms/assign
export const assignRoomService = async (req, res) => {
	try {
		const { RoomID, ServiceID } = req.body;

		const service = await Service.findById(ServiceID);
		if (!service || service.Type !== "Room") {
			return res.status(400).json({
				success: false,
				message: "Không tìm thấy dịch vụ phòng hợp lệ"
			});
		}

    await Service.addServiceToRoom(RoomID, ServiceID);
    res.status(200).json({ success: true, message: "Service assigned successfully" });
  } catch (error) {
		console.log("Assign room service error:", error.message);

		if (error.message.includes("PK_RoomServices")) {
      return res.status(409).json({
        success: false,
        message: "Room has already had this service"
      });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route DELETE /api/services/rooms/remove
export const removeRoomService = async (req, res) => {
	
	try {
		const { RoomID, ServiceID } = req.body;

		const service = await Service.findById(ServiceID);
		if (!service || service.Type !== "Room") {
			return res.status(400).json({
				success: false,
				message: "Không tìm thấy dịch vụ phòng hợp lệ"
			});
		}

    await Service.removeServiceFromRoom(RoomID, ServiceID);
    res.status(200).json({ success: true, message: "Service removed successfully" });
  } catch (error) {
		console.log("Remove room service error: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};