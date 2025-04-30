import { Service } from "../models/service.model.js";
import { Room } from "../models/room.model.js";
import { RoomService } from "../models/roomService.model.js";

// GET /rooms/services
export const getMyRoomServices = async (req, res) => {
	const user = req.user;

  const roomId = user.RoomID;
  const services = await RoomService.getByRoom(roomId);
  res.status(200).json({ success: true, data: services });
};

// GET /rooms/:id/services
export const getRoomServices = async (req, res) => {
  const roomId = parseInt(req.params.id);

  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({
    success: false,
    message: "Room not found"
  });

  const services = await RoomService.getByRoom(roomId);
  res.status(200).json({
    success: true,
    data: services
  });
};

// POST /rooms/:id/services
export const addServiceToRoom = async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const { serviceId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({
      success: false,
      message: "Room not found"
    });

    const service = await Service.findById(serviceId);
    if (!service || service.Type !== "Room")
      return res.status(400).json({
        success: false,
        message: "Invalid room service"
      });

    await RoomService.add(roomId, serviceId);

    res.status(201).json({
      success: true,
      message: "Service assigned to room"
    });
  } catch (error) {
    console.error("Add service to room error:", error.message);
    
    if (error.message.includes("PK_RoomServices")) {
      return res.status(409).json({
        success: false,
        message: "The room has already have this service"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// DELETE /rooms/:id/services/:serviceId
export const removeServiceFromRoom = async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const serviceId = parseInt(req.params.serviceId);
    
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({
      success: false,
      message: "Room not found"
    });
    
    const service = await Service.findById(serviceId);
    if (!service || service.Type !== "Room")
      return res.status(400).json({
        success: false,
        message: "Invalid room service"
      });

    await RoomService.remove(roomId, serviceId);
  
    res.status(200).json({
      success: true,
      message: "Service removed from room"
    });
  } catch (error) {
    console.error("Delete service of room error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
