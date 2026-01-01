import { RoomRequest } from "../models/roomRequest.model.js";
import { Room } from "../models/room.model.js";
import { Notification } from "../models/notification_model.js";

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

    // Backup: DB constraint (race condition)
    if (error.message.includes("UQ_RoomRequests_User_Room_Status")) {
      return res.status(409).json({
				success: false,
        message: "You already have a pending request for this room"
      });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route GET /api/room-requests/all (admin)
export const getAllRoomRequests = async (req, res) => {
  const data = await RoomRequest.getAll();
  res.status(200).json({
    success: true,
    data
  });
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

// @route GET /api/room-requests (admin)
export const getPendingRequests = async (req, res) => {
  const data = await RoomRequest.getPending();
  res.json({ success: true, data });
};

// @route PUT /api/room-requests/:id/approve
export const approveRequest = async (req, res) => {
  try {
    const request = await RoomRequest.findById(req.params.id);

    if (!request || request.Status !== "Pending") {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    // Assign room (trigger + CHECK constraint handle capacity)
    await Room.assignUser(request.UserID, request.RoomID);

    // Update request status
    await RoomRequest.approve(req.params.id, req.user.UserID);

    // Notify user
    await Notification.create({
      userId: request.UserID,
      title: "Room Request Approved",
      content: "Your room request has been approved. You have been assigned to the room."
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

    await RoomRequest.reject(req.params.id, req.user.UserID);

    await Notification.create({
      userId: request.UserID,
      title: "Room Request Rejected",
      content: "Your room request has been rejected. Please choose another room."
    });

    res.json({ success: true, message: "Request rejected successfully" });

  } catch (error) {
    console.error("Reject room request error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};