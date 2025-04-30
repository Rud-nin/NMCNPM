import { RoomRequest } from "../models/roomRequest.model.js";
import { Room } from "../models/room.model.js";
import { Notification } from "../models/notification.model.js";

// @route POST /api/room-requests
export const createRoomRequest = async (req, res) => {
  try {
    const userId = req.user.UserID;
    const { RoomID } = req.body;

    if (!RoomID) {
      return res.status(400).json({
				success: false, message: "RoomID is required"
			});
    }

		if (req.user.RoomID === RoomID) {
			return res.status(400).json({
				success: false, message: "You are already assigned to a room"
			});
		}

    await RoomRequest.create(userId, RoomID);

    res.status(201).json({ success: true, message: "Room request created successfully" });

  } catch (error) {
    console.error("Create room request error:", error.message);
    
    if (error.message.includes("FK_RoomRequests_Room")) {
      return res.status(409).json({
        success: false,
        message: "Room not found"
      });
    }

    if (error.message.includes("UQ_RoomRequests_User_Room_Status")) {
      return res.status(409).json({
				success: false,
        message: "You already have a pending request for this room"
      });
    }

    if (error.message.includes("UX_RoomRequests_User_Room_Pending")) {
      return res.status(409).json({
				success: false,
        message: "Can not request to one room twice"
      });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route GET /api/room-requests/
export const getMyRoomRequests = async (req, res) => {
  const data = await RoomRequest.getByUser(req.user.UserID);
  res.json({ success: true, data });
};

// @route DELETE /api/room-requests/:id
export const cancelRoomRequest = async (req, res) => {
  await RoomRequest.cancel(req.params.id, req.user.UserID);
  res.json({ success: true, message: "Request cancelled" });
};

// @route GET /api/room-requests?status&page&limit (admin)
export const getRoomRequests = async (req, res) => {
  try {
    const status = req.query.status || null; // Pending | Approved | Rejected | null
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { data, totalRows } = await RoomRequest.getByCondition({
      status,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        totalRows,
        totalPages: Math.ceil(totalRows / limit)
      },
      data
    });
  } catch (error) {
    console.error("Get room requests error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @route PUT /api/room-requests/:id/approve
export const approveRequest = async (req, res) => {
  try {
    const request = await RoomRequest.findById(req.params.id);

    if (!request || request.Status !== "Pending") {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const roomId = parseInt(request.RoomID);
    const userId = parseInt(request.UserID);

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Assign room (trigger + CHECK constraint handle capacity)
    await Room.assignUser(userId, roomId);

    // Update request status
    await RoomRequest.approve(req.params.id);

    // Notify user
    await Notification.create({
      receiverId: request.UserID,
      title: "Room Request Approved",
      content: `Your room request has been approved. You have been assigned to ${room.Building}-${room.RoomNumber}.`
    });

    res.json({ success: true, message: "Request approved successfully" });

  } catch (error) {
    console.error("Approve room request error:", error.message);

    // Lỗi do CHECK constraint (phòng đầy)
    if (error.message.includes("CK_Rooms_Occupancy")) {
      return res.status(409).json({
				success: false,
        message: "Room is already full"
      });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route PUT /api/room-requests/:id/reject
export const rejectRequest = async (req, res) => {
  try {
    const request = await RoomRequest.findById(req.params.id);

    if (!request || request.Status !== "Pending") {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const roomId = parseInt(request.RoomID);

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    await RoomRequest.reject(req.params.id);

    await Notification.create({
      receiverId: request.UserID,
      title: "Room Request Rejected",
      content: `Your room request to room ${room.Building}-${room.RoomNumber} has been rejected. Please choose another room.`
    });

    res.json({ success: true, message: "Request rejected successfully" });

  } catch (error) {
    console.error("Reject room request error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};