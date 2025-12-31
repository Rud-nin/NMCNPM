import { Room } from "../models/room.model.js";

// @route GET /api/rooms
export const getRooms = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const { data, totalRows } = await Room.getAll({ page, limit });

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
};

// @route GET /api/rooms/available
export const getAvailableRooms = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const { data, totalRows } = await Room.getAvailable({ page, limit });

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
};

// @route POST /api/rooms (admin)
export const createRoom = async (req, res) => {
	try {
		const { RoomNumber, Building, Capacity } = req.body;

    if (!RoomNumber || !Building || !Capacity) {
      return res.status(400).json({
				success: false,
				message: "Missing required fields"
			});
    }

		await Room.create({ RoomNumber, Building, Capacity });

		res.status(201).json({
			success: true, message: "Room created successfully"
		});
	} catch (error) {
    if (error.message.includes("UQ_Rooms_Building_RoomNumber")) {
      return res.status(409).json({
				success: false,
        message: "Room already exists"
      });
    }

		res.status(500).json({
			success: false,
			message: "Server error"
		});
	}
};

// @route DELETE /api/rooms/:id (admin)
export const deleteRoom = async (req, res) => {
  await Room.delete(req.params.id);
  res.status(200).json({
    success: true, message: "Room deleted (if empty)"
	});
};

// @route PUT /api/rooms/assign
export const assignRoomToUser = async (req, res) => {
	try {
		const { userId, roomId } = req.body;

    if (!userId || !roomId) {
      return res.status(400).json({
				success: false,
				message: "userId and roomId are required"
			});
    }

		// Check room tồn tại
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
				success: false,
        message: "Room not found"
      });
    }

		await Room.assignUser(userId, roomId);

		res.json({
			success: true, message: "User assigned to room"
		});
	} catch (error) {
		if (error.message.includes("CK_Rooms_Occupancy")) {
      return res.status(409).json({
				success: false,
        message: "Room is already full"
      });
    }
	}
};

// @route PUT /api/rooms/remove/:userId
export const removeUserFromRoom = async (req, res) => {
  await Room.removeUser(req.params.userId);
  res.json({
    success: true, message: "User removed from room"
	});
};

// @route GET /api/rooms/:id
export const getUsersInRoomByAdmin = async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);

    if (isNaN(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    // Check phòng tồn tại
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const users = await Room.getUsersInRoom(roomId);

    res.status(200).json({
      success: true,
      room: {
        RoomID: room.RoomID,
        Building: room.Building,
        RoomNumber: room.RoomNumber,
        Capacity: room.Capacity,
        Occupancy: room.Occupancy
      },
      users
    });

  } catch (error) {
    console.error("Admin get users in room error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @route GET /api/rooms/me
export const getUsersInMyRoom = async (req, res) => {
  try {
    const user = req.user;

    if (!user.RoomID) {
      return res.status(400).json({
				success: false,
        message: "You are not assigned to any room"
      });
    }

    const room = await Room.findById(user.RoomID);
    if (!room) {
      return res.status(404).json({
				success: false,
				message: "Room not found"
			});
    }

    const users = await Room.getUsersInRoom(user.RoomID);

    res.status(200).json({
      success: true,
      room,
      users
    });

  } catch (error) {
    console.error("User get users in my room error:", error.message);
    res.status(500).json({
			success: false,
			message: "Server error"
		});
  }
};
